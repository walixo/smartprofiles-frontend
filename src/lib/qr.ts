/**
 * Minimal QR Code encoder (ISO/IEC 18004), byte mode, versions 1–10.
 *
 * Hand-rolled because the stack forbids extra dependencies — the same reason
 * the icons and illustrations are hand-drawn. Scope is deliberately narrow:
 * byte mode at a single error-correction level covers a profile URL and
 * nothing else, which keeps the tables small enough to audit.
 *
 * Correctness is checked by `scripts/verify-qr.ts`, which reads the data bits
 * back out of the finished matrix and confirms they round-trip to the input,
 * and separately proves each block's codeword polynomial is divisible by its
 * Reed–Solomon generator.
 */

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

/** Bit pattern each EC level contributes to the format information. */
const EC_FORMAT_BITS: Record<ErrorCorrectionLevel, number> = { L: 1, M: 0, Q: 3, H: 2 };

/**
 * Block structure at EC level M, indexed by version:
 * [ecCodewordsPerBlock, group1Blocks, group1DataCodewords, group2Blocks, group2DataCodewords]
 */
const EC_BLOCKS_M: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [0, 0, 0, 0, 0],
  [10, 1, 16, 0, 0],
  [16, 1, 28, 0, 0],
  [26, 1, 44, 0, 0],
  [18, 2, 32, 0, 0],
  [24, 2, 43, 0, 0],
  [16, 4, 27, 0, 0],
  [18, 4, 31, 0, 0],
  [22, 2, 38, 2, 39],
  [22, 3, 36, 2, 37],
  [26, 4, 43, 1, 44],
];

/** Alignment pattern centre coordinates per version. */
const ALIGNMENT_CENTRES: ReadonlyArray<readonly number[]> = [
  [],
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
];

/** Unused bits appended after the interleaved codewords, per version. */
const REMAINDER_BITS = [0, 0, 7, 7, 7, 7, 7, 0, 0, 0, 0];

const MAX_VERSION = 10;

/* ------------------------------------------------------------------ */
/* GF(256) arithmetic, primitive polynomial x^8 + x^4 + x^3 + x^2 + 1  */
/* ------------------------------------------------------------------ */

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);

{
  let value = 1;
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = value;
    LOG[value] = i;
    value <<= 1;
    if (value & 0x100) value ^= 0x11d;
  }
  for (let i = 255; i < 512; i += 1) EXP[i] = EXP[i - 255] as number;
}

function gfMultiply(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[(LOG[a] as number) + (LOG[b] as number)] as number;
}

/** Generator polynomial for `degree` error-correction codewords, highest term first. */
export function generatorPolynomial(degree: number): number[] {
  let result = [1];

  for (let i = 0; i < degree; i += 1) {
    const next = new Array<number>(result.length + 1).fill(0);
    for (let j = 0; j < result.length; j += 1) {
      next[j] = (next[j] as number) ^ (result[j] as number);
      next[j + 1] = (next[j + 1] as number) ^ gfMultiply(result[j] as number, EXP[i] as number);
    }
    result = next;
  }

  return result;
}

/** Reed–Solomon remainder for one block. */
export function reedSolomonEncode(data: readonly number[], ecLength: number): number[] {
  const generator = generatorPolynomial(ecLength);
  const buffer = new Array<number>(data.length + ecLength).fill(0);

  data.forEach((byte, index) => {
    buffer[index] = byte;
  });

  for (let i = 0; i < data.length; i += 1) {
    const factor = buffer[i] as number;
    if (factor === 0) continue;
    for (let j = 0; j < generator.length; j += 1) {
      buffer[i + j] = (buffer[i + j] as number) ^ gfMultiply(generator[j] as number, factor);
    }
  }

  return buffer.slice(data.length);
}

/* ------------------------------------------------------------------ */
/* Encoding                                                            */
/* ------------------------------------------------------------------ */

function dataCapacityCodewords(version: number): number {
  const [, g1, g1Data, g2, g2Data] = EC_BLOCKS_M[version] as readonly [
    number,
    number,
    number,
    number,
    number,
  ];
  return g1 * g1Data + g2 * g2Data;
}

function chooseVersion(byteLength: number): number {
  for (let version = 1; version <= MAX_VERSION; version += 1) {
    // 4 mode bits + character count (8 bits below v10, 16 from v10) + payload.
    const countBits = version < 10 ? 8 : 16;
    const needed = Math.ceil((4 + countBits) / 8) + byteLength;
    if (dataCapacityCodewords(version) >= needed) return version;
  }
  throw new Error('Content is too long for a version-10 QR code.');
}

class BitBuffer {
  private readonly bits: number[] = [];

  push(value: number, length: number): void {
    for (let i = length - 1; i >= 0; i -= 1) {
      this.bits.push((value >>> i) & 1);
    }
  }

  get length(): number {
    return this.bits.length;
  }

  toCodewords(): number[] {
    const codewords: number[] = [];
    for (let i = 0; i < this.bits.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8; j += 1) {
        byte = (byte << 1) | (this.bits[i + j] ?? 0);
      }
      codewords.push(byte);
    }
    return codewords;
  }
}

function buildDataCodewords(bytes: Uint8Array, version: number): number[] {
  const capacityBits = dataCapacityCodewords(version) * 8;
  const buffer = new BitBuffer();

  buffer.push(0b0100, 4); // byte mode
  buffer.push(bytes.length, version < 10 ? 8 : 16);
  for (const byte of bytes) buffer.push(byte, 8);

  // Terminator, then pad to a byte boundary.
  buffer.push(0, Math.min(4, capacityBits - buffer.length));
  if (buffer.length % 8 !== 0) buffer.push(0, 8 - (buffer.length % 8));

  const codewords = buffer.toCodewords();
  const padBytes = [0xec, 0x11];
  let padIndex = 0;
  while (codewords.length < capacityBits / 8) {
    codewords.push(padBytes[padIndex % 2] as number);
    padIndex += 1;
  }

  return codewords;
}

/** Splits into blocks, computes EC per block, and interleaves both sets. */
function interleave(dataCodewords: readonly number[], version: number): number[] {
  const [ecPerBlock, g1, g1Data, g2, g2Data] = EC_BLOCKS_M[version] as readonly [
    number,
    number,
    number,
    number,
    number,
  ];

  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];
  let offset = 0;

  for (let i = 0; i < g1 + g2; i += 1) {
    const size = i < g1 ? g1Data : g2Data;
    const block = dataCodewords.slice(offset, offset + size);
    offset += size;
    dataBlocks.push(block);
    ecBlocks.push(reedSolomonEncode(block, ecPerBlock));
  }

  const result: number[] = [];
  const maxData = Math.max(g1Data, g2Data);

  for (let i = 0; i < maxData; i += 1) {
    for (const block of dataBlocks) {
      if (i < block.length) result.push(block[i] as number);
    }
  }

  for (let i = 0; i < ecPerBlock; i += 1) {
    for (const block of ecBlocks) {
      result.push(block[i] as number);
    }
  }

  return result;
}

/* ------------------------------------------------------------------ */
/* Matrix construction                                                 */
/* ------------------------------------------------------------------ */

interface Grid {
  size: number;
  modules: boolean[][];
  /** Function patterns are excluded from data placement and from masking. */
  reserved: boolean[][];
}

function createGrid(version: number): Grid {
  const size = version * 4 + 17;
  return {
    size,
    modules: Array.from({ length: size }, () => new Array<boolean>(size).fill(false)),
    reserved: Array.from({ length: size }, () => new Array<boolean>(size).fill(false)),
  };
}

function setFunction(grid: Grid, row: number, col: number, dark: boolean): void {
  if (row < 0 || col < 0 || row >= grid.size || col >= grid.size) return;
  (grid.modules[row] as boolean[])[col] = dark;
  (grid.reserved[row] as boolean[])[col] = true;
}

function drawFinder(grid: Grid, row: number, col: number): void {
  // 7×7 pattern plus a one-module separator, drawn as a distance field.
  for (let dr = -1; dr <= 7; dr += 1) {
    for (let dc = -1; dc <= 7; dc += 1) {
      const distance = Math.max(Math.abs(dr - 3), Math.abs(dc - 3));
      setFunction(grid, row + dr, col + dc, distance !== 2 && distance !== 4);
    }
  }
}

function drawAlignment(grid: Grid, row: number, col: number): void {
  for (let dr = -2; dr <= 2; dr += 1) {
    for (let dc = -2; dc <= 2; dc += 1) {
      setFunction(grid, row + dr, col + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
    }
  }
}

function drawFunctionPatterns(grid: Grid, version: number): void {
  const last = grid.size - 7;

  drawFinder(grid, 0, 0);
  drawFinder(grid, 0, last);
  drawFinder(grid, last, 0);

  // Timing patterns.
  for (let i = 8; i < grid.size - 8; i += 1) {
    const dark = i % 2 === 0;
    setFunction(grid, 6, i, dark);
    setFunction(grid, i, 6, dark);
  }

  const centres = ALIGNMENT_CENTRES[version] as readonly number[];
  for (let i = 0; i < centres.length; i += 1) {
    for (let j = 0; j < centres.length; j += 1) {
      // The three finder corners already occupy these intersections.
      const isFinderCorner =
        (i === 0 && j === 0) ||
        (i === 0 && j === centres.length - 1) ||
        (i === centres.length - 1 && j === 0);
      if (!isFinderCorner) {
        drawAlignment(grid, centres[i] as number, centres[j] as number);
      }
    }
  }

  // Reserve the format areas; real values are written after the mask is chosen.
  reserveFormatAreas(grid);

  if (version >= 7) drawVersionInfo(grid, version);
}

function reserveFormatAreas(grid: Grid): void {
  for (let i = 0; i <= 8; i += 1) {
    // Index 6 is the timing pattern crossing, not a format module. Writing it
    // here would blank a timing cell that `drawFormatInfo` never restores.
    if (i === 6) continue;
    setFunction(grid, 8, i, false);
    setFunction(grid, i, 8, false);
  }
  for (let i = 0; i < 8; i += 1) {
    setFunction(grid, 8, grid.size - 1 - i, false);
    setFunction(grid, grid.size - 1 - i, 8, false);
  }
  // Always-dark module.
  setFunction(grid, grid.size - 8, 8, true);
}

function drawVersionInfo(grid: Grid, version: number): void {
  let remainder = version;
  for (let i = 0; i < 12; i += 1) {
    remainder = (remainder << 1) ^ ((remainder >>> 11) * 0x1f25);
  }
  const bits = ((version << 12) | remainder) >>> 0;

  for (let i = 0; i < 18; i += 1) {
    const dark = ((bits >>> i) & 1) === 1;
    const a = grid.size - 11 + (i % 3);
    const b = Math.floor(i / 3);
    setFunction(grid, b, a, dark);
    setFunction(grid, a, b, dark);
  }
}

function drawFormatInfo(grid: Grid, ecLevel: ErrorCorrectionLevel, mask: number): void {
  const data = ((EC_FORMAT_BITS[ecLevel] << 3) | mask) & 0x1f;
  let remainder = data;
  for (let i = 0; i < 10; i += 1) {
    remainder = (remainder << 1) ^ ((remainder >>> 9) * 0x537);
  }
  const bits = (((data << 10) | remainder) ^ 0x5412) >>> 0;

  const bit = (index: number): boolean => ((bits >>> index) & 1) === 1;

  // First copy, around the top-left finder.
  for (let i = 0; i <= 5; i += 1) setFunction(grid, i, 8, bit(i));
  setFunction(grid, 7, 8, bit(6));
  setFunction(grid, 8, 8, bit(7));
  setFunction(grid, 8, 7, bit(8));
  for (let i = 9; i < 15; i += 1) setFunction(grid, 8, 14 - i, bit(i));

  // Second copy, split between the other two finders.
  for (let i = 0; i < 8; i += 1) setFunction(grid, 8, grid.size - 1 - i, bit(i));
  for (let i = 8; i < 15; i += 1) setFunction(grid, grid.size - 15 + i, 8, bit(i));
  setFunction(grid, grid.size - 8, 8, true);
}

/** Zigzag placement, two columns at a time, right to left, skipping the timing column. */
function placeData(grid: Grid, codewords: readonly number[], remainderBits: number): void {
  const totalBits = codewords.length * 8 + remainderBits;
  let bitIndex = 0;

  const nextBit = (): boolean => {
    if (bitIndex >= totalBits) return false;
    const byte = codewords[bitIndex >>> 3];
    const bit = byte === undefined ? 0 : (byte >>> (7 - (bitIndex & 7))) & 1;
    bitIndex += 1;
    return bit === 1;
  };

  for (let right = grid.size - 1; right >= 1; right -= 2) {
    // Reassigning (not aliasing) is load-bearing: the loop must continue from 5
    // so the next pair is 3,2. Skipping to a local variable would visit column 4
    // twice and column 0 never, silently corrupting the tail of the stream.
    if (right === 6) right = 5;

    for (let vertical = 0; vertical < grid.size; vertical += 1) {
      for (let j = 0; j < 2; j += 1) {
        const col = right - j;
        const upward = ((right + 1) & 2) === 0;
        const row = upward ? grid.size - 1 - vertical : vertical;

        if (!(grid.reserved[row] as boolean[])[col]) {
          (grid.modules[row] as boolean[])[col] = nextBit();
        }
      }
    }
  }
}

export function maskCondition(mask: number, row: number, col: number): boolean {
  switch (mask) {
    case 0:
      return (row + col) % 2 === 0;
    case 1:
      return row % 2 === 0;
    case 2:
      return col % 3 === 0;
    case 3:
      return (row + col) % 3 === 0;
    case 4:
      return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
    case 5:
      return ((row * col) % 2) + ((row * col) % 3) === 0;
    case 6:
      return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
    default:
      return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
  }
}

function applyMask(grid: Grid, mask: number): void {
  for (let row = 0; row < grid.size; row += 1) {
    for (let col = 0; col < grid.size; col += 1) {
      if (!(grid.reserved[row] as boolean[])[col] && maskCondition(mask, row, col)) {
        const line = grid.modules[row] as boolean[];
        line[col] = !line[col];
      }
    }
  }
}

/** The four penalty rules from the specification; lower is better. */
function penaltyScore(grid: Grid): number {
  const { size, modules } = grid;
  let score = 0;

  const runPenalty = (run: number): number => (run >= 5 ? 3 + (run - 5) : 0);

  // Rule 1 — runs of five or more.
  for (let i = 0; i < size; i += 1) {
    let rowRun = 1;
    let colRun = 1;
    for (let j = 1; j < size; j += 1) {
      const rowLine = modules[i] as boolean[];
      rowRun = rowLine[j] === rowLine[j - 1] ? rowRun + 1 : ((score += runPenalty(rowRun)), 1);
      const a = (modules[j] as boolean[])[i];
      const b = (modules[j - 1] as boolean[])[i];
      colRun = a === b ? colRun + 1 : ((score += runPenalty(colRun)), 1);
    }
    score += runPenalty(rowRun) + runPenalty(colRun);
  }

  // Rule 2 — 2×2 blocks of one colour.
  for (let row = 0; row < size - 1; row += 1) {
    for (let col = 0; col < size - 1; col += 1) {
      const value = (modules[row] as boolean[])[col];
      if (
        value === (modules[row] as boolean[])[col + 1] &&
        value === (modules[row + 1] as boolean[])[col] &&
        value === (modules[row + 1] as boolean[])[col + 1]
      ) {
        score += 3;
      }
    }
  }

  // Rule 3 — finder-like 1:1:3:1:1 sequences.
  const pattern = [true, false, true, true, true, false, true, false, false, false, false];
  const reversed = [...pattern].reverse();

  const matches = (get: (index: number) => boolean, start: number, target: boolean[]): boolean =>
    target.every((expected, offset) => get(start + offset) === expected);

  for (let i = 0; i < size; i += 1) {
    for (let j = 0; j + 11 <= size; j += 1) {
      const rowGet = (index: number): boolean => (modules[i] as boolean[])[index] === true;
      const colGet = (index: number): boolean => (modules[index] as boolean[])[i] === true;
      if (matches(rowGet, j, pattern) || matches(rowGet, j, reversed)) score += 40;
      if (matches(colGet, j, pattern) || matches(colGet, j, reversed)) score += 40;
    }
  }

  // Rule 4 — deviation from an even distribution of dark modules.
  let dark = 0;
  for (const row of modules) for (const cell of row) if (cell) dark += 1;
  const percent = (dark * 100) / (size * size);
  score += Math.floor(Math.abs(percent - 50) / 5) * 10;

  return score;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export interface QrCode {
  size: number;
  version: number;
  mask: number;
  ecLevel: ErrorCorrectionLevel;
  /** `modules[row][col]` — true is a dark module. */
  modules: boolean[][];
}

/**
 * Encodes `text` as a QR matrix.
 *
 * Only EC level M is produced: it survives ordinary print wear and phone-camera
 * blur while staying small enough to scan from a lanyard badge, which is the
 * situation this is for.
 */
export function encodeQr(text: string): QrCode {
  const bytes = new TextEncoder().encode(text);
  const version = chooseVersion(bytes.length);
  const ecLevel: ErrorCorrectionLevel = 'M';

  const dataCodewords = buildDataCodewords(bytes, version);
  const codewords = interleave(dataCodewords, version);

  let best: Grid | null = null;
  let bestMask = 0;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let mask = 0; mask < 8; mask += 1) {
    const grid = createGrid(version);
    drawFunctionPatterns(grid, version);
    placeData(grid, codewords, REMAINDER_BITS[version] as number);
    applyMask(grid, mask);
    drawFormatInfo(grid, ecLevel, mask);

    const score = penaltyScore(grid);
    if (score < bestScore) {
      bestScore = score;
      bestMask = mask;
      best = grid;
    }
  }

  const grid = best as Grid;
  return { size: grid.size, version, mask: bestMask, ecLevel, modules: grid.modules };
}

/**
 * Renders the dark modules as a single SVG path.
 *
 * One path rather than a rect per module keeps the DOM small (a version-3 code
 * is ~350 dark modules) and lets the colour be set once with `fill`, so the
 * code inherits the theme.
 */
export function qrToSvgPath(code: QrCode): string {
  const parts: string[] = [];

  for (let row = 0; row < code.size; row += 1) {
    for (let col = 0; col < code.size; col += 1) {
      if ((code.modules[row] as boolean[])[col]) {
        parts.push(`M${col} ${row}h1v1h-1z`);
      }
    }
  }

  return parts.join('');
}

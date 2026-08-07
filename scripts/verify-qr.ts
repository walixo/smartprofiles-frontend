/**
 * Correctness harness for the hand-rolled QR encoder.
 *
 *   node scripts/verify-qr.ts
 *
 * Three independent checks, because a QR code that renders but does not scan
 * fails silently — nothing in the app would ever notice.
 *
 *  1. Round-trip. Rebuilds the function-pattern map from the specification
 *     (independently of the encoder), decodes the format information out of
 *     the matrix, un-masks, reads the zigzag, de-interleaves, and parses the
 *     byte-mode segment back to a string. Catches errors in bit packing,
 *     placement, masking, interleaving and format info.
 *  2. Reed–Solomon. Proves each block's (data ‖ ec) polynomial is exactly
 *     divisible by its generator — the defining property of a valid codeword.
 *  3. Structure. Finder patterns, timing patterns and the always-dark module.
 */

import { encodeQr, generatorPolynomial, maskCondition, type QrCode } from '../src/lib/qr.ts';

const EC_BLOCKS_M: Record<number, [number, number, number, number, number]> = {
  1: [10, 1, 16, 0, 0],
  2: [16, 1, 28, 0, 0],
  3: [26, 1, 44, 0, 0],
  4: [18, 2, 32, 0, 0],
  5: [24, 2, 43, 0, 0],
  6: [16, 4, 27, 0, 0],
  7: [18, 4, 31, 0, 0],
  8: [22, 2, 38, 2, 39],
  9: [22, 3, 36, 2, 37],
  10: [26, 4, 43, 1, 44],
};

const ALIGNMENT_CENTRES: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
};

/** Independently derived reserved-module map — deliberately not the encoder's. */
function buildReserved(size: number, version: number): boolean[][] {
  const reserved = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const mark = (r: number, c: number) => {
    if (r >= 0 && c >= 0 && r < size && c < size) reserved[r][c] = true;
  };

  for (let d = -1; d <= 7; d += 1) {
    for (let e = -1; e <= 7; e += 1) {
      mark(d, e);
      mark(d, size - 7 + e);
      mark(size - 7 + d, e);
    }
  }

  for (let i = 0; i < size; i += 1) {
    mark(6, i);
    mark(i, 6);
  }

  const centres = ALIGNMENT_CENTRES[version];
  for (let i = 0; i < centres.length; i += 1) {
    for (let j = 0; j < centres.length; j += 1) {
      const corner =
        (i === 0 && j === 0) ||
        (i === 0 && j === centres.length - 1) ||
        (i === centres.length - 1 && j === 0);
      if (corner) continue;
      for (let dr = -2; dr <= 2; dr += 1) {
        for (let dc = -2; dc <= 2; dc += 1) mark(centres[i] + dr, centres[j] + dc);
      }
    }
  }

  for (let i = 0; i <= 8; i += 1) {
    mark(8, i);
    mark(i, 8);
  }
  for (let i = 0; i < 8; i += 1) {
    mark(8, size - 1 - i);
    mark(size - 1 - i, 8);
  }

  if (version >= 7) {
    for (let i = 0; i < 18; i += 1) {
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      mark(b, a);
      mark(a, b);
    }
  }

  return reserved;
}

/** Reads the 15 format bits from the top-left copy and validates the BCH code. */
function decodeFormat(code: QrCode): { ecBits: number; mask: number } {
  const bits: number[] = [];
  for (let i = 0; i <= 5; i += 1) bits[i] = code.modules[i][8] ? 1 : 0;
  bits[6] = code.modules[7][8] ? 1 : 0;
  bits[7] = code.modules[8][8] ? 1 : 0;
  bits[8] = code.modules[8][7] ? 1 : 0;
  for (let i = 9; i < 15; i += 1) bits[i] = code.modules[8][14 - i] ? 1 : 0;

  let value = 0;
  for (let i = 14; i >= 0; i -= 1) value = (value << 1) | bits[i];
  const unmasked = value ^ 0x5412;

  let remainder = unmasked;
  for (let i = 0; i < 15; i += 1) {
    if ((remainder >>> (14 - i)) & 1) remainder ^= 0x537 << (4 - i);
  }
  if ((remainder & 0x3ff) !== 0) throw new Error('format information fails its BCH check');

  const data = unmasked >>> 10;
  return { ecBits: (data >>> 3) & 3, mask: data & 7 };
}

function readCodewords(code: QrCode, mask: number, reserved: boolean[][]): number[] {
  const bits: number[] = [];

  for (let right = code.size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vertical = 0; vertical < code.size; vertical += 1) {
      for (let j = 0; j < 2; j += 1) {
        const col = right - j;
        const upward = ((right + 1) & 2) === 0;
        const row = upward ? code.size - 1 - vertical : vertical;
        if (reserved[row][col]) continue;
        const raw = code.modules[row][col];
        bits.push((maskCondition(mask, row, col) ? !raw : raw) ? 1 : 0);
      }
    }
  }

  const codewords: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j += 1) byte = (byte << 1) | bits[i + j];
    codewords.push(byte);
  }
  return codewords;
}

function deinterleave(
  codewords: number[],
  version: number,
): { data: number[]; blocks: Array<{ data: number[]; ec: number[] }> } {
  const [ecPerBlock, g1, g1Data, g2, g2Data] = EC_BLOCKS_M[version];
  const sizes: number[] = [];
  for (let i = 0; i < g1 + g2; i += 1) sizes.push(i < g1 ? g1Data : g2Data);

  const dataBlocks: number[][] = sizes.map(() => []);
  let cursor = 0;
  const maxData = Math.max(g1Data, g2Data);

  for (let i = 0; i < maxData; i += 1) {
    for (let b = 0; b < sizes.length; b += 1) {
      if (i < sizes[b]) dataBlocks[b].push(codewords[cursor++]);
    }
  }

  const ecBlocks: number[][] = sizes.map(() => []);
  for (let i = 0; i < ecPerBlock; i += 1) {
    for (let b = 0; b < sizes.length; b += 1) ecBlocks[b].push(codewords[cursor++]);
  }

  return {
    data: dataBlocks.flat(),
    blocks: dataBlocks.map((data, i) => ({ data, ec: ecBlocks[i] })),
  };
}

function parseByteSegment(data: number[], version: number): string {
  const bits: number[] = [];
  for (const byte of data) for (let i = 7; i >= 0; i -= 1) bits.push((byte >>> i) & 1);

  let cursor = 0;
  const take = (n: number): number => {
    let value = 0;
    for (let i = 0; i < n; i += 1) value = (value << 1) | bits[cursor++];
    return value;
  };

  const mode = take(4);
  if (mode !== 0b0100) throw new Error(`expected byte mode, got mode ${mode.toString(2)}`);

  const length = take(version < 10 ? 8 : 16);
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) bytes[i] = take(8);

  return new TextDecoder().decode(bytes);
}

/* GF(256) for the divisibility proof. */
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
{
  let v = 1;
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = v;
    LOG[v] = i;
    v <<= 1;
    if (v & 0x100) v ^= 0x11d;
  }
  for (let i = 255; i < 512; i += 1) EXP[i] = EXP[i - 255];
}
const mul = (a: number, b: number): number => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]);

/** A valid QR block satisfies (data ‖ ec) mod generator == 0. */
function isDivisibleByGenerator(block: { data: number[]; ec: number[] }, ecLength: number): boolean {
  const generator = generatorPolynomial(ecLength);
  const buffer = [...block.data, ...block.ec];

  for (let i = 0; i < block.data.length; i += 1) {
    const factor = buffer[i];
    if (factor === 0) continue;
    for (let j = 0; j < generator.length; j += 1) buffer[i + j] ^= mul(generator[j], factor);
  }

  return buffer.every((byte) => byte === 0);
}

function checkStructure(code: QrCode): string[] {
  const problems: string[] = [];
  const at = (r: number, c: number) => code.modules[r][c];

  for (const [originRow, originCol] of [
    [0, 0],
    [0, code.size - 7],
    [code.size - 7, 0],
  ]) {
    for (let dr = 0; dr < 7; dr += 1) {
      for (let dc = 0; dc < 7; dc += 1) {
        const ring = Math.max(Math.abs(dr - 3), Math.abs(dc - 3));
        if (at(originRow + dr, originCol + dc) !== (ring !== 2)) {
          problems.push(`finder at ${originRow},${originCol} wrong on offset ${dr},${dc}`);
        }
      }
    }
  }

  for (let i = 8; i < code.size - 8; i += 1) {
    if (at(6, i) !== (i % 2 === 0)) problems.push(`horizontal timing wrong at column ${i}`);
    if (at(i, 6) !== (i % 2 === 0)) problems.push(`vertical timing wrong at row ${i}`);
  }

  if (!at(code.size - 8, 8)) problems.push('always-dark module is light');

  return problems.slice(0, 5);
}

/* ------------------------------------------------------------------ */

const CASES = [
  'https://smartprofiles.eu/@lea-dubois',
  'https://smartprofiles.eu/@a',
  'http://localhost:5173/@marco-rossi-sound-design',
  'https://smartprofiles.eu/@bjorn-larsson',
  'HELLO WORLD',
  'https://smartprofiles.eu/@ana-garcia?utm_source=qr&utm_medium=badge&utm_campaign=brussels-meetup-2026',
  'Grüße aus Österreich — åäö, çà, ñ',
];

let failures = 0;

for (const input of CASES) {
  const label = input.length > 46 ? `${input.slice(0, 43)}…` : input;

  try {
    const code = encodeQr(input);
    const reserved = buildReserved(code.size, code.version);
    const format = decodeFormat(code);

    if (format.mask !== code.mask) {
      throw new Error(`format info says mask ${format.mask}, encoder chose ${code.mask}`);
    }
    if (format.ecBits !== 0) {
      throw new Error(`format info says EC bits ${format.ecBits}, expected 0 (level M)`);
    }

    const codewords = readCodewords(code, format.mask, reserved);
    const { data, blocks } = deinterleave(codewords, code.version);
    const decoded = parseByteSegment(data, code.version);

    if (decoded !== input) {
      throw new Error(`round-trip mismatch\n      expected ${JSON.stringify(input)}\n      got      ${JSON.stringify(decoded)}`);
    }

    const ecLength = EC_BLOCKS_M[code.version][0];
    const badBlock = blocks.findIndex((block) => !isDivisibleByGenerator(block, ecLength));
    if (badBlock !== -1) throw new Error(`block ${badBlock} is not divisible by its RS generator`);

    const structural = checkStructure(code);
    if (structural.length > 0) throw new Error(structural.join('; '));

    console.log(
      `  PASS  v${String(code.version).padStart(2)} ${String(code.size).padStart(2)}×${code.size} ` +
        `mask ${code.mask} · ${blocks.length} block(s) · ${label}`,
    );
  } catch (error) {
    failures += 1;
    console.error(`  FAIL  ${label}\n      ${(error as Error).message}`);
  }
}

console.log(
  failures === 0
    ? `\nAll ${CASES.length} cases round-tripped, RS-verified and structurally sound.`
    : `\n${failures} of ${CASES.length} cases failed.`,
);

process.exit(failures === 0 ? 0 : 1);

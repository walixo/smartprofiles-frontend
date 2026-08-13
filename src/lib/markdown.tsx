import type { ReactNode } from 'react';

/**
 * Deliberately tiny Markdown subset: paragraphs, unordered lists, bold, italic,
 * inline code and links.
 *
 * It renders to React elements rather than an HTML string — there is no
 * `dangerouslySetInnerHTML` anywhere, so a bio cannot inject markup no matter
 * what it contains. Link hrefs are additionally restricted to http(s) and
 * mailto, which blocks `javascript:` URLs.
 */

const INLINE = /(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;
const SAFE_PROTOCOL = /^(https?:|mailto:)/i;

export function renderMarkdown(source: string): ReactNode {
  const blocks = source.replace(/\r\n/g, '\n').split(/\n{2,}/);

  return blocks.map((block, blockIndex) => {
    const lines = block.split('\n').filter((line) => line.trim().length > 0);
    if (lines.length === 0) return null;

    const isList = lines.every((line) => /^\s*[-*]\s+/.test(line));

    if (isList) {
      return (
        <ul key={blockIndex} className="my-3 list-disc space-y-1 pl-5">
          {lines.map((line, i) => (
            <li key={i}>{renderInline(line.replace(/^\s*[-*]\s+/, ''))}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={blockIndex} className="my-3 first:mt-0 last:mb-0">
        {lines.map((line, i) => (
          <span key={i}>
            {i > 0 ? <br /> : null}
            {renderInline(line)}
          </span>
        ))}
      </p>
    );
  });
}

function renderInline(text: string): ReactNode {
  return text.split(INLINE).map((token, index) => {
    if (!token) return null;

    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }

    if (token.startsWith('_') && token.endsWith('_') && token.length > 2) {
      return <em key={index}>{token.slice(1, -1)}</em>;
    }

    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code key={index} className="rounded bg-paper-200 px-1.5 py-0.5 text-[0.85em] dark:bg-ink-800">
          {token.slice(1, -1)}
        </code>
      );
    }

    const link = LINK.exec(token);
    if (link) {
      const [, label, href] = link as unknown as [string, string, string];
      // Anything that is not plainly http(s) or mailto renders as inert text.
      if (!SAFE_PROTOCOL.test(href)) return <span key={index}>{label}</span>;
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-400"
        >
          {label}
        </a>
      );
    }

    return <span key={index}>{token}</span>;
  });
}

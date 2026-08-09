import { useId } from 'react';
import { useI18n } from '@/i18n/i18n-provider';

export interface ViewsChartProps {
  daily: Array<{ day: string; count: number }>;
  label: string;
}

/**
 * Daily views as a hand-drawn SVG bar chart.
 *
 * No charting library — the stack forbids new dependencies, and a bar chart is
 * arithmetic. Bars use palette tokens so it re-tones with the theme, and the
 * underlying numbers are also exposed as a visually-hidden table, because a
 * chart alone is unreadable to a screen reader.
 */
export function ViewsChart({ daily, label }: ViewsChartProps) {
  const { formatDate } = useI18n();
  const tableId = useId();

  const peak = Math.max(1, ...daily.map((entry) => entry.count));
  const width = 100;
  const height = 32;
  const gap = 0.35;
  const barWidth = width / daily.length - gap;

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={label}
        aria-describedby={tableId}
        className="h-32 w-full"
      >
        {daily.map((entry, index) => {
          // A day with views always gets a visible sliver, so "1" never looks
          // identical to "0".
          const barHeight = entry.count === 0 ? 0 : Math.max(0.8, (entry.count / peak) * height);
          return (
            <rect
              key={entry.day}
              x={index * (barWidth + gap)}
              y={height - barHeight}
              width={barWidth}
              height={barHeight}
              rx={0.4}
              className={entry.count === 0 ? 'fill-sand-200 dark:fill-ink-800' : 'fill-brand-500'}
            >
              <title>{`${formatDate(entry.day)} — ${entry.count}`}</title>
            </rect>
          );
        })}
        {/* Baseline, so an all-zero window still reads as a chart. */}
        <rect x={0} y={height - 0.25} width={width} height={0.25} className="fill-sand-300 dark:fill-ink-700" />
      </svg>

      <table id={tableId} className="sr-only">
        <caption>{label}</caption>
        <tbody>
          {daily.map((entry) => (
            <tr key={entry.day}>
              <th scope="row">{formatDate(entry.day)}</th>
              <td>{entry.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

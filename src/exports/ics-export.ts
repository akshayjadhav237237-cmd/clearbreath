import type { Clock, IdGenerator } from '../shared/ports';
import type { DailyPlan } from '../domain/contracts';

const CRLF = '\r\n';
const MAX_OCTETS = 75;

/** Escapes text content according to RFC 5545 section 3.3.11. */
export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Folds an ICS content line at 75 octets inserting CRLF and a space. */
export function foldIcsLine(line: string): string {
  if (line.length <= MAX_OCTETS) {
    return line;
  }
  const chunks: string[] = [];
  let remaining = line;
  chunks.push(remaining.slice(0, MAX_OCTETS));
  remaining = remaining.slice(MAX_OCTETS);

  while (remaining.length > 0) {
    chunks.push(` ${remaining.slice(0, MAX_OCTETS - 1)}`);
    remaining = remaining.slice(MAX_OCTETS - 1);
  }
  return chunks.join(CRLF);
}

/** Formats a timestamp into RFC 5545 UTC datetime string (YYYYMMDDTHHMMSSZ). */
function formatUtcTimestamp(timestampMs: number): string {
  const d = new Date(timestampMs);
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = d.getUTCFullYear();
  const m = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const h = pad(d.getUTCHours());
  const min = pad(d.getUTCMinutes());
  const s = pad(d.getUTCSeconds());
  return `${y}${m}${day}T${h}${min}${s}Z`;
}

/** Formats a local date and hour into floating datetime (YYYYMMDDTHH0000). */
function formatFloatingDateTime(
  year: number,
  month: number,
  day: number,
  hour: number
): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${year}${pad(month)}${pad(day)}T${pad(hour)}0000`;
}

interface VEventParams {
  readonly uid: string;
  readonly stamp: string;
  readonly summary: string;
  readonly desc: string;
  readonly start: string;
  readonly end: string;
}

/** Builds an RFC 5545 VEVENT string for daily recurring smog routine windows. */
function buildVEvent(p: VEventParams): string[] {
  return [
    'BEGIN:VEVENT',
    `UID:${p.uid}@clearbreath.local`,
    `DTSTAMP:${p.stamp}`,
    `SUMMARY:${escapeIcsText(p.summary)}`,
    `DESCRIPTION:${escapeIcsText(p.desc)}`,
    `DTSTART:${p.start}`,
    `DTEND:${p.end}`,
    'RRULE:FREQ=DAILY',
    'END:VEVENT',
  ];
}

/** Builds scheduled VEVENT blocks for ventilation and air purifier routines. */
function buildRoutineEvents(
  plan: DailyPlan,
  stamp: string,
  idGen: IdGenerator,
  ymd: { year: number; month: number; day: number }
): string[] {
  const events: string[] = [];
  if (plan.bestVentilationWindow) {
    events.push(
      ...buildVEvent({
        uid: idGen.next(),
        stamp,
        summary: 'Clearbreath: Optimal Ventilation Window',
        desc: `Open cross-ventilation windows during lowest ambient AQI. Advisory: ${plan.advisorySummary}`,
        start: formatFloatingDateTime(
          ymd.year,
          ymd.month,
          ymd.day,
          plan.bestVentilationWindow.startHour
        ),
        end: formatFloatingDateTime(
          ymd.year,
          ymd.month,
          ymd.day,
          plan.bestVentilationWindow.endHour
        ),
      })
    );
  }

  events.push(
    ...buildVEvent({
      uid: idGen.next(),
      stamp,
      summary: 'Clearbreath: Air Purifier Night Boost',
      desc: 'Set air purifier to high speed before bedtime to clean bedroom air for vulnerable members.',
      start: formatFloatingDateTime(ymd.year, ymd.month, ymd.day, 21),
      end: formatFloatingDateTime(ymd.year, ymd.month, ymd.day, 23),
    })
  );
  return events;
}

/** Generates RFC 5545 conforming iCalendar schedule for daily smog action routines. */
export function exportDailyPlanIcs(
  plan: DailyPlan,
  clock: Clock,
  idGen: IdGenerator
): string {
  const stamp = formatUtcTimestamp(clock.now());
  const d = new Date(clock.now());
  const ymd = {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Clearbreath//Winter Smog Action Plan//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...buildRoutineEvents(plan, stamp, idGen, ymd),
    'END:VCALENDAR',
  ];

  return lines.map(foldIcsLine).join(CRLF) + CRLF;
}

import { describe, it, expect } from 'vitest';
import type { DailyPlan } from '../../src/domain/contracts';
import type { Clock, IdGenerator } from '../../src/shared/ports';
import {
  exportDailyPlanIcs,
  escapeIcsText,
  foldIcsLine,
} from '../../src/exports';

/** Unfolds RFC 5545 lines by joining continuation lines. */
function unfoldLines(rawIcs: string): string[] {
  const rawLines = rawIcs.split('\r\n').filter((l) => l.length > 0);
  const unfolded: string[] = [];
  for (const line of rawLines) {
    if (line.startsWith(' ') && unfolded.length > 0) {
      unfolded[unfolded.length - 1] += line.slice(1);
    } else {
      unfolded.push(line);
    }
  }
  return unfolded;
}

/** Parses unfolded RFC 5545 lines into event property records. */
function extractEvents(lines: readonly string[]): Record<string, string>[] {
  const events: Record<string, string>[] = [];
  let currentEvent: Record<string, string> | null = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      currentEvent = {};
    } else if (line === 'END:VEVENT' && currentEvent) {
      events.push(currentEvent);
      currentEvent = null;
    } else if (currentEvent) {
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        currentEvent[line.slice(0, colonIdx)] = line.slice(colonIdx + 1);
      }
    }
  }
  return events;
}

describe('RFC 5545 ICS calendar export', () => {
  const mockClock: Clock = { now: () => 1700000000000 };
  let idCounter = 100;
  const mockIdGen: IdGenerator = { next: () => `id-${idCounter++}` };

  const mockPlan: DailyPlan = {
    outdoorWindows: [],
    bestVentilationWindow: { startHour: 13, endHour: 15 },
    purifierSchedule: [{ hour: 21, operationalState: 'high' }],
    hourlyAqi: [],
    advisorySummary: 'Smog peak; ventilate between 13:00 and 15:00.',
  };

  it('escapes delimiters properly according to RFC 5545', () => {
    expect(escapeIcsText('Clean; Air, Filter\\Mask\nNow')).toBe(
      'Clean\\; Air\\, Filter\\\\Mask\\nNow'
    );
  });

  it('folds lines exceeding 75 octets', () => {
    const longLine = 'DESCRIPTION:' + 'A'.repeat(100);
    const folded = foldIcsLine(longLine);
    const parts = folded.split('\r\n');
    expect(parts.length).toBeGreaterThan(1);
    expect(parts[0]?.length).toBeLessThanOrEqual(75);
    expect(parts[1]?.startsWith(' ')).toBe(true);
  });

  it('generates valid RFC 5545 calendar with hand-written parser verification', () => {
    const ics = exportDailyPlanIcs(mockPlan, mockClock, mockIdGen);
    const rawLines = ics.split('\r\n').filter((l) => l.length > 0);
    const unfolded = unfoldLines(ics);
    const events = extractEvents(unfolded);

    for (const line of rawLines) {
      expect(line.length).toBeLessThanOrEqual(75);
    }

    expect(unfolded[0]).toBe('BEGIN:VCALENDAR');
    expect(unfolded).toContain('VERSION:2.0');
    expect(events).toHaveLength(2);

    const ventEvent = events.find((e) =>
      e['SUMMARY']?.includes('Ventilation Window')
    );
    expect(ventEvent?.['RRULE']).toBe('FREQ=DAILY');
    expect(ventEvent?.['UID']).toContain('@clearbreath.local');

    const purifierEvent = events.find((e) =>
      e['SUMMARY']?.includes('Air Purifier Night Boost')
    );
    expect(purifierEvent?.['RRULE']).toBe('FREQ=DAILY');
  });
});

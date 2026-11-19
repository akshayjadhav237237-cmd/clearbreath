import type { SensitivityLevel } from '../contracts';
import type { OutdoorWindow } from './outdoor-windows';
import type { VentilationWindow } from './ventilation';

/** Generates actionable diurnal advisory summary text for households. */
export function generateAdvisorySummary(
  isAllSevere: boolean,
  outdoorWindows: readonly OutdoorWindow[],
  ventilationWindow: VentilationWindow | null,
  sensitivity: SensitivityLevel
): string {
  if (isAllSevere) {
    return 'Severe air quality (AQI > 400) throughout the day. Stay indoors with windows sealed and operate air purifiers on high mode.';
  }

  const bestOutdoor = outdoorWindows[0];
  if (bestOutdoor === undefined) {
    if (sensitivity === 'high') {
      return 'Outdoor air quality exceeds recommended limits for high-sensitivity members (AQI > 200). Stay indoors and minimize outdoor exposure.';
    }
    return 'Elevated smog levels persist. Avoid outdoor exertion and keep indoor air cleaned.';
  }

  let text = `Optimal outdoor window is ${bestOutdoor.startHour}:00 to ${bestOutdoor.endHour}:00 (average AQI ${bestOutdoor.averageAqi}).`;

  if (ventilationWindow !== null) {
    text += ` Best natural ventilation window is ${ventilationWindow.startHour}:00 to ${ventilationWindow.endHour}:00.`;
  } else {
    text +=
      ' Keep windows closed as ambient AQI remains above 200 throughout the day.';
  }

  text += ' Run air purifiers on high during sleep and peak smog hours.';

  return text;
}

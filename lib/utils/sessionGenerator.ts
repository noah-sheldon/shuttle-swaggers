import { Session } from "@/types";

export interface SessionTemplate {
  dayOfWeek: number;
  location: "Watford Central" | "Fuller Health Life Centre";
  courts: number;
  startHour: number; // London time
  startMinute: number;
}

const SESSION_TEMPLATES: SessionTemplate[] = [
  {
    dayOfWeek: 2, // Tuesday
    location: "Watford Central",
    courts: 2,
    startHour: 20,
    startMinute: 0,
  },
  {
    dayOfWeek: 4, // Thursday
    location: "Fuller Health Life Centre",
    courts: 4,
    startHour: 20,
    startMinute: 0,
  },
];

/**
 * Convert a London local time into a UTC Date safely.
 */
function londonTimeToUTC(date: Date, hour: number, minute: number) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Format the desired London datetime
  const parts = formatter.formatToParts(
    new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hour,
        minute
      )
    )
  );

  const obj: any = {};
  for (const p of parts) if (p.type !== "literal") obj[p.type] = p.value;

  // Build ISO string manually
  const iso = `${obj.year}-${obj.month}-${obj.day}T${obj.hour}:${obj.minute}:${obj.second}Z`;

  return new Date(iso);
}

export function generateSessions(
  startDate: Date,
  monthsAhead: number = 2
): Omit<Session, "_id">[] {
  const sessions: Omit<Session, "_id">[] = [];

  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + monthsAhead);

  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const dayOfWeek = cursor.getDay();

    const template = SESSION_TEMPLATES.find((t) => t.dayOfWeek === dayOfWeek);

    if (template) {
      // Convert 8 PM London time → correct UTC time automatically
      const dateUTC = londonTimeToUTC(
        cursor,
        template.startHour,
        template.startMinute
      );

      sessions.push({
        date: dateUTC,
        location: template.location,
        config: {
          game_type: "partnership_rotation",
          scoring_system: "single_set_21",
          court_count: template.courts,
          max_duration_minutes: 120,
          skill_balancing: true,
        },
        courts_data: [],
        player_data: [],
        matches: [],
        rankings: [],
        is_live: false,
        status: "upcoming",
        waiting_queue: [],
        next_up_queue: [],

        // legacy
        courts: template.courts,
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return sessions;
}

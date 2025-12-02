import { SessionModel } from "@/lib/db/models/session";
import {
  getISODateUTC,
  getStartOfTodayUTC,
  normalizeToUTCDate,
} from "@/lib/utils/dateHelpers";
import { generateSessions } from "@/lib/utils/sessionGenerator";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, monthsAhead = 2 } = body;

    // Determine start date (UTC-normalized)
    const start = startDate
      ? normalizeToUTCDate(startDate)
      : getStartOfTodayUTC();

    // Generate sessions from start date → N months ahead
    const sessionsToCreate = generateSessions(start, monthsAhead);

    // Load all existing sessions
    const existingSessions = await SessionModel.findUpcoming();

    // Normalize existing session dates to UTC date keys
    const existingDateKeys = new Set(
      existingSessions.map(
        (session) => getISODateUTC(session.date).split("T")[0]
      )
    );

    // Filter out duplicates using normalized keys
    const newSessions = sessionsToCreate.filter((session) => {
      const sessionDateKey = getISODateUTC(session.date).split("T")[0];
      return !existingDateKeys.has(sessionDateKey);
    });

    // Insert new sessions into DB
    const createdSessions = [];
    for (const sessionData of newSessions) {
      const session = await SessionModel.create(sessionData);
      createdSessions.push(session);
    }

    return NextResponse.json({
      message: `Generated ${createdSessions.length} new sessions`,
      sessions: createdSessions,
      skipped: sessionsToCreate.length - newSessions.length,
    });
  } catch (error) {
    console.error("Error generating sessions:", error);
    return NextResponse.json(
      { error: "Failed to generate sessions" },
      { status: 500 }
    );
  }
}

import { Session } from '@/types';

export interface SessionTemplate {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, 2 = Tuesday, 4 = Thursday
  location: 'Watford Central' | 'Fuller Health Life Centre';
  courts: number;
  startHour: number;
  startMinute: number;
}

const SESSION_TEMPLATES: SessionTemplate[] = [
  {
    dayOfWeek: 2, // Tuesday
    location: 'Watford Central',
    courts: 2,
    startHour: 20, // 8 PM
    startMinute: 0
  },
  {
    dayOfWeek: 4, // Thursday
    location: 'Fuller Health Life Centre',
    courts: 4,
    startHour: 20, // 8 PM
    startMinute: 0
  }
];

export function generateSessions(startDate: Date, monthsAhead: number = 2): Omit<Session, '_id'>[] {
  const sessions: Omit<Session, '_id'>[] = [];
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + monthsAhead);

  // Start from the given start date
  const currentDate = new Date(startDate);
  
  // Find the next Tuesday (August 26, 2025)
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    
    // Check if current date matches any of our session templates
    const template = SESSION_TEMPLATES.find(t => t.dayOfWeek === dayOfWeek);
    
    if (template) {
      const sessionDate = new Date(currentDate);
      // Set time in UTC to avoid timezone issues
      sessionDate.setUTCHours(template.startHour, template.startMinute, 0, 0);
      
      sessions.push({
        date: sessionDate,
        location: template.location,
        config: {
          game_type: 'partnership_rotation',
          scoring_system: 'single_set_21',
          court_count: template.courts,
          max_duration_minutes: 120,
          skill_balancing: true
        },
        courts_data: [],
        player_data: [],
        matches: [],
        rankings: [],
        is_live: false,
        status: 'upcoming',
        waiting_queue: [],
        next_up_queue: [],
        
        // Legacy support
        courts: template.courts
      });
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return sessions;
}

export function getNextSessionDate(dayOfWeek: number, referenceDate: Date = new Date()): Date {
  const date = new Date(referenceDate);
  const days = (dayOfWeek + 7 - date.getDay()) % 7;
  date.setDate(date.getDate() + days);
  return date;
}
/**
 * Google Calendar Integration Service
 *
 * Handles creating calendar events for showings and sending
 * invites to both agents and clients.
 */

import { google, calendar_v3 } from "googleapis";

export interface CalendarEvent {
  summary: string;
  description: string;
  location: string;
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  attendees: { email: string; displayName?: string }[];
  reminders?: {
    useDefault: boolean;
    overrides?: { method: "email" | "popup"; minutes: number }[];
  };
}

export interface CreatedEvent {
  eventId: string;
  htmlLink: string;
  status: string;
}

/**
 * Google Calendar Client using Service Account
 */
export class GoogleCalendarClient {
  private calendar: calendar_v3.Calendar;
  private calendarId: string;

  constructor(credentials: {
    clientEmail: string;
    privateKey: string;
    calendarId: string;
  }) {
    const auth = new google.auth.JWT({
      email: credentials.clientEmail,
      key: credentials.privateKey,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    this.calendar = google.calendar({ version: "v3", auth });
    this.calendarId = credentials.calendarId;
  }

  /**
   * Create a calendar event for a showing
   */
  async createShowingEvent(event: CalendarEvent): Promise<CreatedEvent> {
    const response = await this.calendar.events.insert({
      calendarId: this.calendarId,
      sendUpdates: "all", // Send email invites to all attendees
      requestBody: {
        summary: event.summary,
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.startTime,
          timeZone: "America/Chicago", // Oklahoma timezone
        },
        end: {
          dateTime: event.endTime,
          timeZone: "America/Chicago",
        },
        attendees: event.attendees.map((a) => ({
          email: a.email,
          displayName: a.displayName,
        })),
        reminders: event.reminders || {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 }, // 24 hours before
            { method: "popup", minutes: 60 }, // 1 hour before
            { method: "popup", minutes: 15 }, // 15 minutes before
          ],
        },
        conferenceData: undefined, // No video call needed for in-person showings
      },
    });

    return {
      eventId: response.data.id || "",
      htmlLink: response.data.htmlLink || "",
      status: response.data.status || "confirmed",
    };
  }

  /**
   * Update an existing calendar event
   */
  async updateShowingEvent(
    eventId: string,
    event: Partial<CalendarEvent>
  ): Promise<CreatedEvent> {
    const updateData: calendar_v3.Schema$Event = {};

    if (event.summary) updateData.summary = event.summary;
    if (event.description) updateData.description = event.description;
    if (event.location) updateData.location = event.location;
    if (event.startTime) {
      updateData.start = {
        dateTime: event.startTime,
        timeZone: "America/Chicago",
      };
    }
    if (event.endTime) {
      updateData.end = {
        dateTime: event.endTime,
        timeZone: "America/Chicago",
      };
    }
    if (event.attendees) {
      updateData.attendees = event.attendees.map((a) => ({
        email: a.email,
        displayName: a.displayName,
      }));
    }

    const response = await this.calendar.events.patch({
      calendarId: this.calendarId,
      eventId,
      sendUpdates: "all",
      requestBody: updateData,
    });

    return {
      eventId: response.data.id || "",
      htmlLink: response.data.htmlLink || "",
      status: response.data.status || "confirmed",
    };
  }

  /**
   * Cancel a calendar event
   */
  async cancelShowingEvent(eventId: string): Promise<void> {
    await this.calendar.events.delete({
      calendarId: this.calendarId,
      eventId,
      sendUpdates: "all", // Notify attendees of cancellation
    });
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(maxResults = 10): Promise<calendar_v3.Schema$Event[]> {
    const response = await this.calendar.events.list({
      calendarId: this.calendarId,
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: "startTime",
    });

    return response.data.items || [];
  }
}

/**
 * Create a showing calendar event with formatted details
 */
export function formatShowingEvent(showing: {
  property: {
    address: string;
    city: string;
    state: string;
    zip: string;
    price: number;
    beds: number;
    baths: number;
  };
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  agent: {
    name: string;
    email: string;
    phone?: string;
  };
  scheduledAt: string;
  endTime: string;
  notes?: string;
}): CalendarEvent {
  const { property, client, agent, scheduledAt, endTime, notes } = showing;

  const fullAddress = `${property.address}, ${property.city}, ${property.state} ${property.zip}`;
  const priceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);

  return {
    summary: `Showing: ${property.address}`,
    description: `
Property Showing

ADDRESS: ${fullAddress}
PRICE: ${priceFormatted}
DETAILS: ${property.beds} bed, ${property.baths} bath

CLIENT: ${client.firstName} ${client.lastName}
CLIENT PHONE: ${client.phone || "Not provided"}
CLIENT EMAIL: ${client.email}

AGENT: ${agent.name}
AGENT PHONE: ${agent.phone || "Not provided"}

${notes ? `NOTES: ${notes}` : ""}

---
Scheduled via OpenHouse
    `.trim(),
    location: fullAddress,
    startTime: scheduledAt,
    endTime: endTime,
    attendees: [
      { email: agent.email, displayName: agent.name },
      { email: client.email, displayName: `${client.firstName} ${client.lastName}` },
    ],
  };
}

/**
 * Create Google Calendar client from environment variables
 */
export function createGoogleCalendarClient(): GoogleCalendarClient | null {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!clientEmail || !privateKey || !calendarId) {
    console.warn("Google Calendar credentials not configured");
    return null;
  }

  return new GoogleCalendarClient({
    clientEmail,
    privateKey,
    calendarId,
  });
}

/**
 * ShowingTime Integration Service
 *
 * ShowingTime API requires MLS partnership access.
 * This service is prepared for integration once credentials are available.
 *
 * ShowingTime is part of Zillow Group's ShowingTime+ platform and integrates
 * with the Bridge API for MLS data.
 */

// ShowingTime appointment request
export interface ShowingRequest {
  listingId: string;
  listingKey: string;
  requestedDate: string; // ISO date
  requestedTime: string; // HH:MM format
  alternateDate?: string;
  alternateTime?: string;
  buyerAgentId: string;
  buyerAgentName: string;
  buyerAgentPhone: string;
  buyerAgentEmail: string;
  buyerName?: string;
  buyerPhone?: string;
  notes?: string;
}

// ShowingTime appointment response
export interface ShowingAppointment {
  appointmentId: string;
  listingId: string;
  listingAddress: string;
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';
  scheduledDate: string;
  scheduledTime: string;
  duration: number; // minutes
  listingAgentName?: string;
  listingAgentPhone?: string;
  confirmationCode?: string;
  accessInstructions?: string;
  feedback?: ShowingFeedback;
}

export interface ShowingFeedback {
  rating: number; // 1-5
  interested: boolean;
  comments?: string;
  priceOpinion?: 'too_high' | 'fair' | 'good_value';
  submittedAt: string;
}

// Available time slots from ShowingTime
export interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
  duration: number;
}

/**
 * ShowingTime API Client
 *
 * Note: Full implementation requires ShowingTime API credentials
 * which are obtained through MLS partnership (e.g., Oklahoma MLS via Bridge)
 */
export class ShowingTimeClient {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private mlsId: string;

  constructor(config: {
    apiKey: string;
    apiSecret: string;
    mlsId: string;
    sandbox?: boolean;
  }) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.mlsId = config.mlsId;
    this.baseUrl = config.sandbox
      ? 'https://api-sandbox.showingtime.com/v1'
      : 'https://api.showingtime.com/v1';
  }

  /**
   * Get available showing times for a listing
   */
  async getAvailability(
    listingId: string,
    startDate: string,
    endDate: string
  ): Promise<TimeSlot[]> {
    // TODO: Implement when ShowingTime credentials are available
    // This will call ShowingTime's availability endpoint

    // For now, generate mock availability (remove when real API is connected)
    return this.generateMockAvailability(startDate, endDate);
  }

  /**
   * Request a showing appointment
   */
  async requestShowing(request: ShowingRequest): Promise<ShowingAppointment> {
    // TODO: Implement when ShowingTime credentials are available
    // POST to ShowingTime's appointment request endpoint

    // Mock response for development
    return {
      appointmentId: `ST-${Date.now()}`,
      listingId: request.listingId,
      listingAddress: '', // Would come from ShowingTime
      status: 'pending',
      scheduledDate: request.requestedDate,
      scheduledTime: request.requestedTime,
      duration: 30,
    };
  }

  /**
   * Get appointment status
   */
  async getAppointment(appointmentId: string): Promise<ShowingAppointment | null> {
    // TODO: Implement when ShowingTime credentials are available
    return null;
  }

  /**
   * Cancel an appointment
   */
  async cancelAppointment(appointmentId: string, reason?: string): Promise<boolean> {
    // TODO: Implement when ShowingTime credentials are available
    return true;
  }

  /**
   * Submit feedback after a showing
   */
  async submitFeedback(
    appointmentId: string,
    feedback: Omit<ShowingFeedback, 'submittedAt'>
  ): Promise<boolean> {
    // TODO: Implement when ShowingTime credentials are available
    return true;
  }

  /**
   * Get all appointments for an agent
   */
  async getAgentAppointments(
    agentId: string,
    status?: ShowingAppointment['status']
  ): Promise<ShowingAppointment[]> {
    // TODO: Implement when ShowingTime credentials are available
    return [];
  }

  /**
   * Generate mock availability for development
   * Remove this when real ShowingTime API is connected
   */
  private generateMockAvailability(startDate: string, endDate: string): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // Skip weekends for mock data
      if (d.getDay() === 0 || d.getDay() === 6) continue;

      for (const time of times) {
        slots.push({
          date: d.toISOString().split('T')[0],
          time,
          available: Math.random() > 0.3, // 70% availability
          duration: 30,
        });
      }
    }

    return slots;
  }
}

/**
 * Create ShowingTime client from environment variables
 */
export function createShowingTimeClient(): ShowingTimeClient | null {
  const apiKey = process.env.SHOWINGTIME_API_KEY;
  const apiSecret = process.env.SHOWINGTIME_API_SECRET;
  const mlsId = process.env.SHOWINGTIME_MLS_ID;

  if (!apiKey || !apiSecret || !mlsId) {
    console.warn('ShowingTime credentials not configured');
    return null;
  }

  return new ShowingTimeClient({
    apiKey,
    apiSecret,
    mlsId,
    sandbox: process.env.NODE_ENV !== 'production',
  });
}

/**
 * Create a mock client for development/testing
 */
export function createMockShowingTimeClient(): ShowingTimeClient {
  return new ShowingTimeClient({
    apiKey: 'mock-key',
    apiSecret: 'mock-secret',
    mlsId: 'mock-mls',
    sandbox: true,
  });
}

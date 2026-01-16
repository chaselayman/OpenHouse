/**
 * SimplyRETS Integration Service
 *
 * SimplyRETS provides a unified API to access MLS data from 500+ MLS systems.
 * Docs: https://docs.simplyrets.com/api/index.html
 */

// SimplyRETS Listing Response
export interface SimplyRetsListing {
  mlsId: number;
  listingId: string;
  listDate: string;
  lastUpdate: string;
  listPrice: number;
  listingContractDate?: string;
  closeDate?: string;
  closePrice?: number;
  property: {
    type: string;
    subType?: string;
    bedrooms: number;
    bathsFull: number;
    bathsHalf?: number;
    area: number; // sqft
    areaSource?: string;
    lotSize?: number;
    lotSizeArea?: number;
    lotSizeAreaUnits?: string;
    parking?: {
      spaces?: number;
      description?: string;
    };
    yearBuilt?: number;
    style?: string;
    stories?: number;
    garageSpaces?: number;
    view?: string;
    subdivision?: string;
    exteriorFeatures?: string[];
    interiorFeatures?: string[];
    roof?: string;
    flooring?: string[];
    heating?: string;
    cooling?: string;
    construction?: string[];
    pool?: string;
    waterSource?: string;
  };
  address: {
    full: string;
    streetNumber?: string;
    streetName?: string;
    streetSuffix?: string;
    unit?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  geo: {
    lat: number;
    lng: number;
    marketArea?: string;
    county?: string;
    directions?: string;
  };
  agent?: {
    firstName?: string;
    lastName?: string;
    contact?: {
      email?: string;
      office?: string;
      cell?: string;
    };
  };
  office?: {
    name?: string;
    contact?: {
      email?: string;
      phone?: string;
    };
  };
  photos: string[];
  remarks?: string;
  privateRemarks?: string;
  showingInstructions?: string;
  association?: {
    fee?: number;
    frequency?: string;
    amenities?: string[];
  };
  tax?: {
    id?: string;
    annualAmount?: number;
    year?: number;
  };
  coAgent?: {
    firstName?: string;
    lastName?: string;
  };
  mls: {
    status: string;
    statusText: string;
    daysOnMarket?: number;
    area?: string;
    areaMinor?: string;
  };
  virtualTourUrl?: string;
  disclaimer?: string;
}

// Search parameters
export interface SimplyRetsSearchParams {
  q?: string; // Full text search
  status?: 'Active' | 'Pending' | 'Closed' | 'ActiveUnderContract';
  type?: 'residential' | 'rental' | 'mobilehome' | 'condominium' | 'multifamily' | 'land' | 'farm';
  subtype?: string;
  minprice?: number;
  maxprice?: number;
  minarea?: number;
  maxarea?: number;
  minbeds?: number;
  maxbeds?: number;
  minbaths?: number;
  maxbaths?: number;
  minyear?: number;
  agent?: string;
  brokers?: string[];
  cities?: string[];
  counties?: string[];
  postalCodes?: string[];
  neighborhoods?: string[];
  points?: string; // Polygon search: "lat1,lng1,lat2,lng2,..."
  include?: string[]; // Include additional fields
  sort?: string; // Sort field
  limit?: number; // Max 500
  offset?: number;
  lastId?: number; // Pagination cursor
  water?: boolean;
  features?: string[];
}

// Normalized property for our app
export interface NormalizedProperty {
  mls_id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  year_built: number | null;
  lot_size: number | null;
  photos: string[];
  description: string | null;
  highlights: string[];
  property_type: string;
  status: string;
  days_on_market: number | null;
  listing_agent: string | null;
  listing_office: string | null;
  latitude: number | null;
  longitude: number | null;
  virtual_tour_url: string | null;
  listing_url: string | null;
  raw_data: SimplyRetsListing;
}

/**
 * SimplyRETS API Client
 */
export class SimplyRetsClient {
  private username: string;
  private password: string;
  private baseUrl = 'https://api.simplyrets.com';

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    return `Basic ${credentials}`;
  }

  private async request<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => url.searchParams.append(key, String(v)));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': this.getAuthHeader(),
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SimplyRETS API error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Search for listings
   */
  async searchListings(params: SimplyRetsSearchParams = {}): Promise<SimplyRetsListing[]> {
    // Default to active listings if not specified
    const searchParams = {
      status: 'Active',
      limit: 50,
      ...params,
    };

    return this.request<SimplyRetsListing[]>('/properties', searchParams);
  }

  /**
   * Get a single listing by MLS ID
   */
  async getListing(mlsId: string): Promise<SimplyRetsListing> {
    return this.request<SimplyRetsListing>(`/properties/${mlsId}`);
  }

  /**
   * Get open houses
   */
  async getOpenHouses(params?: {
    listingId?: string;
    cities?: string[];
    startdate?: string;
    enddate?: string;
    offset?: number;
    limit?: number;
  }): Promise<Array<{
    listingId: string;
    startTime: string;
    endTime: string;
    description?: string;
  }>> {
    return this.request('/openhouses', params);
  }

  /**
   * Normalize a SimplyRETS listing to our app's property format
   */
  normalizeListing(listing: SimplyRetsListing): NormalizedProperty {
    const highlights: string[] = [];

    // Extract key features as highlights
    if (listing.property.yearBuilt) {
      highlights.push(`Built in ${listing.property.yearBuilt}`);
    }
    if (listing.property.garageSpaces) {
      highlights.push(`${listing.property.garageSpaces}-car garage`);
    }
    if (listing.property.pool) {
      highlights.push('Pool');
    }
    if (listing.property.stories && listing.property.stories > 1) {
      highlights.push(`${listing.property.stories} stories`);
    }
    if (listing.property.view) {
      highlights.push(`${listing.property.view} view`);
    }
    if (listing.property.lotSizeArea && listing.property.lotSizeArea > 0.5) {
      highlights.push(`${listing.property.lotSizeArea.toFixed(2)} acre lot`);
    }

    // Add some interior features
    if (listing.property.interiorFeatures) {
      const goodFeatures = listing.property.interiorFeatures.filter(f =>
        /fireplace|hardwood|granite|stainless|updated|renovated|open.*floor/i.test(f)
      ).slice(0, 3);
      highlights.push(...goodFeatures);
    }

    // Calculate total baths
    const totalBaths = (listing.property.bathsFull || 0) + (listing.property.bathsHalf || 0) * 0.5;

    return {
      mls_id: listing.listingId,
      address: listing.address.full,
      city: listing.address.city,
      state: listing.address.state,
      zip: listing.address.postalCode,
      price: listing.listPrice,
      beds: listing.property.bedrooms,
      baths: totalBaths,
      sqft: listing.property.area,
      year_built: listing.property.yearBuilt || null,
      lot_size: listing.property.lotSizeArea || null,
      photos: listing.photos || [],
      description: listing.remarks || null,
      highlights: highlights.slice(0, 6), // Limit to 6 highlights
      property_type: listing.property.type,
      status: listing.mls.status.toLowerCase(),
      days_on_market: listing.mls.daysOnMarket || null,
      listing_agent: listing.agent
        ? `${listing.agent.firstName || ''} ${listing.agent.lastName || ''}`.trim() || null
        : null,
      listing_office: listing.office?.name || null,
      latitude: listing.geo?.lat || null,
      longitude: listing.geo?.lng || null,
      virtual_tour_url: listing.virtualTourUrl || null,
      listing_url: null, // SimplyRETS doesn't provide this, would need to construct
      raw_data: listing,
    };
  }

  /**
   * Search and normalize listings
   */
  async search(params: SimplyRetsSearchParams = {}): Promise<NormalizedProperty[]> {
    const listings = await this.searchListings(params);
    return listings.map(listing => this.normalizeListing(listing));
  }
}

/**
 * Create SimplyRETS client from environment variables
 */
export function createSimplyRetsClient(): SimplyRetsClient | null {
  const username = process.env.SIMPLYRETS_API_USERNAME;
  const password = process.env.SIMPLYRETS_API_PASSWORD;

  if (!username || !password) {
    console.warn('SimplyRETS credentials not configured');
    return null;
  }

  return new SimplyRetsClient(username, password);
}

/**
 * Create a demo/mock client for testing
 * SimplyRETS provides a demo account for testing
 */
export function createDemoSimplyRetsClient(): SimplyRetsClient {
  // SimplyRETS demo credentials (public)
  return new SimplyRetsClient('simplyrets', 'simplyrets');
}

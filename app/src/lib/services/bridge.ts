/**
 * Bridge API Integration Service (Zillow Group)
 * Documentation: https://bridgedataoutput.com/docs/platform/API/bridge
 *
 * Base URL: https://api.bridgedataoutput.com/api/v2
 * Authentication: Server Token (Bearer)
 *
 * Bridge API uses OData query syntax for filtering and selecting data.
 * Data is RESO Web API compliant.
 */

// Bridge API Property Types (RESO Standard)
export type BridgePropertyType =
  | "Residential"
  | "Residential Income"
  | "Residential Lease"
  | "Land"
  | "Commercial Sale"
  | "Commercial Lease"
  | "Farm";

export type BridgeStandardStatus =
  | "Active"
  | "Active Under Contract"
  | "Pending"
  | "Hold"
  | "Withdrawn"
  | "Closed"
  | "Expired"
  | "Canceled"
  | "Delete"
  | "Coming Soon";

// Bridge API Media Object
export interface BridgeMedia {
  MediaKey: string;
  MediaURL: string;
  MediaCategory: string;
  MimeType: string;
  ShortDescription: string;
  Order: number;
}

// Bridge API Property/Listing
export interface BridgeListing {
  ListingKey: string;
  ListingId: string;
  ListPrice: number;
  OriginalListPrice: number;
  ClosePrice: number | null;
  StandardStatus: BridgeStandardStatus;
  PropertyType: BridgePropertyType;
  PropertySubType: string;

  // Address
  StreetNumber: string;
  StreetNumberNumeric: number;
  StreetName: string;
  StreetSuffix: string;
  UnitNumber: string;
  City: string;
  StateOrProvince: string;
  PostalCode: string;
  Country: string;
  UnparsedAddress: string;

  // Property Details
  BedroomsTotal: number;
  BathroomsTotalInteger: number;
  BathroomsFull: number;
  BathroomsHalf: number;
  LivingArea: number;
  LivingAreaUnits: string;
  LotSizeAcres: number;
  LotSizeSquareFeet: number;
  YearBuilt: number;
  Stories: number;
  GarageSpaces: number;

  // Features
  Appliances: string[];
  InteriorFeatures: string[];
  ExteriorFeatures: string[];
  Heating: string[];
  Cooling: string[];
  PoolFeatures: string[];
  Flooring: string[];
  FireplacesTotal: number;

  // Listing Info
  DaysOnMarket: number;
  ListingContractDate: string;
  ModificationTimestamp: string;
  BridgeModificationTimestamp: string;
  PublicRemarks: string;
  PrivateRemarks: string;
  ShowingInstructions: string;

  // Agent/Office
  ListAgentKey: string;
  ListAgentFullName: string;
  ListAgentEmail: string;
  ListAgentDirectPhone: string;
  ListAgentOfficePhone: string;
  ListOfficeName: string;
  ListOfficeKey: string;

  // Media
  Media: BridgeMedia[];

  // Geo
  Latitude: number;
  Longitude: number;

  // Tax/HOA
  TaxAnnualAmount: number;
  AssociationFee: number;
  AssociationFeeFrequency: string;
}

// Search Parameters
export interface BridgeSearchParams {
  // Text search
  q?: string;

  // Status filter
  status?: BridgeStandardStatus[];

  // Property type filter
  propertyType?: BridgePropertyType[];

  // Price range
  minPrice?: number;
  maxPrice?: number;

  // Beds/Baths
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;

  // Size
  minArea?: number;
  maxArea?: number;

  // Year
  minYear?: number;
  maxYear?: number;

  // Location
  cities?: string[];
  postalCodes?: string[];
  stateOrProvince?: string;

  // Geo search (bounding box)
  bbox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };

  // Pagination
  top?: number; // Max 200
  skip?: number;

  // Sort
  orderBy?: string;

  // Select specific fields
  select?: string[];
}

// Configuration
interface BridgeConfig {
  accessToken: string;
  datasetKey: string; // e.g., "okmls" for Oklahoma MLS
  baseUrl?: string;
}

const DEFAULT_BASE_URL = "https://api.bridgedataoutput.com/api/v2";

/**
 * Bridge API Client
 */
export class BridgeClient {
  private accessToken: string;
  private datasetKey: string;
  private baseUrl: string;

  constructor(config: BridgeConfig) {
    this.accessToken = config.accessToken;
    this.datasetKey = config.datasetKey;
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  }

  /**
   * Build OData filter string from search params
   */
  private buildFilter(params: BridgeSearchParams): string {
    const filters: string[] = [];

    // Status filter
    if (params.status && params.status.length > 0) {
      const statusFilters = params.status.map(s => `StandardStatus eq '${s}'`);
      filters.push(`(${statusFilters.join(" or ")})`);
    }

    // Property type filter
    if (params.propertyType && params.propertyType.length > 0) {
      const typeFilters = params.propertyType.map(t => `PropertyType eq '${t}'`);
      filters.push(`(${typeFilters.join(" or ")})`);
    }

    // Price range
    if (params.minPrice) {
      filters.push(`ListPrice ge ${params.minPrice}`);
    }
    if (params.maxPrice) {
      filters.push(`ListPrice le ${params.maxPrice}`);
    }

    // Bedrooms
    if (params.minBeds) {
      filters.push(`BedroomsTotal ge ${params.minBeds}`);
    }
    if (params.maxBeds) {
      filters.push(`BedroomsTotal le ${params.maxBeds}`);
    }

    // Bathrooms
    if (params.minBaths) {
      filters.push(`BathroomsTotalInteger ge ${params.minBaths}`);
    }

    // Living area
    if (params.minArea) {
      filters.push(`LivingArea ge ${params.minArea}`);
    }
    if (params.maxArea) {
      filters.push(`LivingArea le ${params.maxArea}`);
    }

    // Year built
    if (params.minYear) {
      filters.push(`YearBuilt ge ${params.minYear}`);
    }
    if (params.maxYear) {
      filters.push(`YearBuilt le ${params.maxYear}`);
    }

    // City filter
    if (params.cities && params.cities.length > 0) {
      const cityFilters = params.cities.map(c => `City eq '${c}'`);
      filters.push(`(${cityFilters.join(" or ")})`);
    }

    // Postal code filter
    if (params.postalCodes && params.postalCodes.length > 0) {
      const zipFilters = params.postalCodes.map(z => `PostalCode eq '${z}'`);
      filters.push(`(${zipFilters.join(" or ")})`);
    }

    // State filter
    if (params.stateOrProvince) {
      filters.push(`StateOrProvince eq '${params.stateOrProvince}'`);
    }

    // Text search (search in address and remarks)
    if (params.q) {
      const searchTerm = params.q.replace(/'/g, "''"); // Escape single quotes
      filters.push(`(contains(UnparsedAddress, '${searchTerm}') or contains(PublicRemarks, '${searchTerm}'))`);
    }

    // Geo bounding box
    if (params.bbox) {
      filters.push(`Latitude ge ${params.bbox.south}`);
      filters.push(`Latitude le ${params.bbox.north}`);
      filters.push(`Longitude ge ${params.bbox.west}`);
      filters.push(`Longitude le ${params.bbox.east}`);
    }

    return filters.join(" and ");
  }

  /**
   * Make authenticated request to Bridge API
   */
  private async request<T>(
    endpoint: string,
    queryParams?: Record<string, string>
  ): Promise<{ data: T; totalCount: number | null }> {
    const url = new URL(`${this.baseUrl}/OData/${this.datasetKey}${endpoint}`);

    // Add query parameters
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) {
          url.searchParams.append(key, value);
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bridge API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    // Bridge returns { value: [...], @odata.count: N }
    return {
      data: result.value || result,
      totalCount: result["@odata.count"] || null,
    };
  }

  /**
   * Search for properties
   */
  async searchProperties(params?: BridgeSearchParams): Promise<{
    listings: BridgeListing[];
    totalCount: number | null;
  }> {
    const queryParams: Record<string, string> = {};

    // Build filter
    if (params) {
      const filter = this.buildFilter(params);
      if (filter) {
        queryParams["$filter"] = filter;
      }

      // Pagination
      queryParams["$top"] = String(Math.min(params.top || 50, 200));
      if (params.skip) {
        queryParams["$skip"] = String(params.skip);
      }

      // Sort
      if (params.orderBy) {
        queryParams["$orderby"] = params.orderBy;
      } else {
        queryParams["$orderby"] = "BridgeModificationTimestamp desc";
      }

      // Select specific fields (improves performance)
      if (params.select && params.select.length > 0) {
        queryParams["$select"] = params.select.join(",");
      }

      // Always request count
      queryParams["$count"] = "true";
    }

    const { data, totalCount } = await this.request<BridgeListing[]>("/Property", queryParams);

    return {
      listings: data,
      totalCount,
    };
  }

  /**
   * Get a single property by ListingKey
   */
  async getProperty(listingKey: string): Promise<BridgeListing> {
    const { data } = await this.request<BridgeListing>(`/Property('${listingKey}')`);
    return data;
  }

  /**
   * Get properties modified since a timestamp (for syncing)
   */
  async getModifiedSince(timestamp: string, limit = 200): Promise<{
    listings: BridgeListing[];
    totalCount: number | null;
  }> {
    const queryParams: Record<string, string> = {
      "$filter": `BridgeModificationTimestamp gt ${timestamp}`,
      "$orderby": "BridgeModificationTimestamp asc",
      "$top": String(limit),
      "$count": "true",
    };

    const { data, totalCount } = await this.request<BridgeListing[]>("/Property", queryParams);

    return {
      listings: data,
      totalCount,
    };
  }

  /**
   * Get available datasets/resources
   */
  async getDataSystems(): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/DataSystem`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get data systems: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.searchProperties({ top: 1 });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create a Bridge client with environment credentials
 */
export function createBridgeClient(): BridgeClient {
  const accessToken = process.env.BRIDGE_ACCESS_TOKEN;
  const datasetKey = process.env.BRIDGE_DATASET_KEY;

  if (!accessToken || !datasetKey) {
    throw new Error(
      "Bridge API credentials not configured. Set BRIDGE_ACCESS_TOKEN and BRIDGE_DATASET_KEY environment variables."
    );
  }

  return new BridgeClient({ accessToken, datasetKey });
}

/**
 * Create a demo Bridge client using test credentials
 * Note: Test dataset has limited sample data
 */
export function createDemoBridgeClient(): BridgeClient {
  return new BridgeClient({
    accessToken: "6baca547742c6f96a6ff71b138424f21",
    datasetKey: "test",
  });
}

/**
 * Convert Bridge listing to our database property format
 */
export function convertBridgeListingToProperty(
  listing: BridgeListing,
  agentId: string
) {
  // Map Bridge status to our status
  const statusMap: Record<string, "active" | "pending" | "sold" | "off_market"> = {
    "Active": "active",
    "Active Under Contract": "pending",
    "Pending": "pending",
    "Coming Soon": "active",
    "Hold": "off_market",
    "Withdrawn": "off_market",
    "Closed": "sold",
    "Expired": "off_market",
    "Canceled": "off_market",
    "Delete": "off_market",
  };

  // Map property type
  const typeMap: Record<string, string> = {
    "Residential": "Single Family",
    "Residential Income": "Multi-Family",
    "Residential Lease": "Rental",
    "Land": "Land",
    "Commercial Sale": "Commercial",
    "Commercial Lease": "Commercial",
    "Farm": "Farm",
  };

  // Build address
  const address = listing.UnparsedAddress ||
    [listing.StreetNumber, listing.StreetName, listing.StreetSuffix]
      .filter(Boolean)
      .join(" ");

  // Extract features
  const features: string[] = [
    ...(listing.InteriorFeatures || []),
    ...(listing.ExteriorFeatures || []),
  ];
  if (listing.PoolFeatures?.length > 0) {
    features.push(`Pool: ${listing.PoolFeatures.join(", ")}`);
  }
  if (listing.GarageSpaces > 0) {
    features.push(`${listing.GarageSpaces} Car Garage`);
  }
  if (listing.FireplacesTotal > 0) {
    features.push(`${listing.FireplacesTotal} Fireplace(s)`);
  }

  // Get photo URLs
  const photos = (listing.Media || [])
    .filter(m => m.MediaCategory === "Photo" || m.MimeType?.startsWith("image/"))
    .sort((a, b) => (a.Order || 0) - (b.Order || 0))
    .slice(0, 10)
    .map(m => m.MediaURL);

  return {
    agent_id: agentId,
    mls_id: listing.ListingId || listing.ListingKey,
    address,
    city: listing.City,
    state: listing.StateOrProvince,
    zip: listing.PostalCode,
    price: listing.ListPrice,
    beds: listing.BedroomsTotal,
    baths: listing.BathroomsFull + (listing.BathroomsHalf || 0) * 0.5,
    sqft: listing.LivingArea,
    lot_size: listing.LotSizeAcres || null,
    year_built: listing.YearBuilt || null,
    property_type: typeMap[listing.PropertyType] || listing.PropertySubType || "Residential",
    status: statusMap[listing.StandardStatus] || "active",
    listing_agent_name: listing.ListAgentFullName || null,
    listing_agent_phone: listing.ListAgentDirectPhone || listing.ListAgentOfficePhone || null,
    listing_agent_email: listing.ListAgentEmail || null,
    photos,
    description: listing.PublicRemarks || null,
    features: features.length > 0 ? features : null,
  };
}

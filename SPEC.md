# OpenHouse - Project Specification

## Overview

OpenHouse is an AI-powered real estate assistant that automates the home showing process for real estate agents. It scrapes MLS listings, analyzes properties for red flags, generates personalized recommendations, and handles booking coordination with clients through ShowingTime integration.

## Problem Statement

Real estate agents spend significant time on repetitive tasks:
- Manually searching MLS for properties matching client criteria
- Reviewing listing photos for potential issues
- Writing personalized property descriptions for clients
- Coordinating showing schedules through ShowingTime
- Managing communication with multiple clients

## Solution

A fully automated pipeline where agents simply provide a client's email and preferences, and the system handles everything from property discovery to showing coordination.

---

## Core Features

### 1. MLS Scraping & Filtering

**Functionality:**
- Connect to MLS data sources (API or web scraping)
- Filter properties based on agent-defined restrictions:
  - Price range
  - Location/neighborhoods
  - Bedrooms/bathrooms
  - Square footage
  - Property type
  - Lot size
  - Year built
  - Days on market
  - Other custom criteria

**Technical Considerations:**
- MLS data access varies by region (RETS, RESO Web API, or scraping)
- May require agent's MLS credentials
- Need to handle rate limiting and data freshness

---

### 2. AI Image Analysis & Red Flag Detection

**Functionality:**
- Analyze listing photos using computer vision
- Detect potential red flags:
  - Water stains/damage on ceilings or walls
  - Foundation cracks
  - Roof issues visible in exterior shots
  - Outdated electrical panels
  - Signs of deferred maintenance
  - Cluttered or poorly staged homes
  - Suspicious photo angles (hiding something)
  - Missing photos of key areas (basement, garage, etc.)
  - HVAC age/condition if visible
  - Landscaping/drainage concerns

**Output:**
- Risk score per property
- List of specific concerns with confidence levels
- Flagged images with annotations

**Technical Considerations:**
- Use vision LLM (GPT-4V, Claude Vision) or specialized models
- Balance sensitivity (don't flag everything) with thoroughness

---

### 3. AI-Generated Property Introductions

**Functionality:**
- Generate personalized write-ups for each recommended property
- Explain why this property matches the client's needs
- Highlight key selling points
- Mention any caveats (red flags detected, but minor)
- Tailored tone based on client preferences

**Example Output:**
> "This charming 3-bed Colonial in Maple Heights checks all your boxes - updated kitchen, the large backyard you wanted for the kids, and it's in the school district you specified. The $425K price is $25K under your max, leaving room for the minor cosmetic updates in the basement. I noticed the roof looks original (circa 2010), so we should ask about that during the showing."

---

### 4. ShowingTime Integration

**Functionality:**
- Connect to ShowingTime API
- Fetch available showing slots for properties
- Book confirmed showings automatically
- Handle scheduling conflicts
- Send confirmation/reminder notifications
- Manage cancellations and rescheduling

**Technical Considerations:**
- ShowingTime API access requirements
- Agent authentication/authorization
- Handling listing agent approval workflows

---

### 5. Client Portal & Booking Interface

**Functionality:**
- Clients receive email with curated property list
- Each property includes:
  - AI-generated introduction
  - Key stats and photos
  - Available showing times
  - One-click booking
- Clients select preferred times
- System coordinates and confirms bookings
- Calendar integration (Google, Outlook, Apple)

**User Flow:**
1. Agent inputs client email + search criteria
2. System finds matching properties
3. System analyzes images, filters out red flags
4. System generates personalized recommendations
5. Client receives email with property cards
6. Client clicks to book showing times
7. System books through ShowingTime
8. Agent and client receive confirmations
9. Agent shows up to showings

---

## Technical Architecture

### Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Agent Dashboard                          │
│                   (Web App - React/Next.js)                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API Layer                               │
│                    (Node.js / Python)                           │
├─────────────┬─────────────┬─────────────┬──────────────────────┤
│ MLS Service │ Image AI    │ Content Gen │ Booking Service      │
│             │ Service     │ Service     │                      │
└─────────────┴─────────────┴─────────────┴──────────────────────┘
        │             │             │                │
        ▼             ▼             ▼                ▼
┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────────┐
│ MLS Data  │  │ Vision AI │  │ LLM API   │  │ ShowingTime API   │
│ Sources   │  │ (Claude/  │  │ (Claude)  │  │                   │
│           │  │  GPT-4V)  │  │           │  │                   │
└───────────┘  └───────────┘  └───────────┘  └───────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Client Portal                              │
│              (Email + Web Booking Interface)                    │
└─────────────────────────────────────────────────────────────────┘
```

### Data Models

**Client**
- id
- email
- name
- agent_id
- search_criteria (JSON)
- preferences
- created_at

**Property**
- id
- mls_number
- address
- price
- bedrooms, bathrooms, sqft
- listing_data (JSON)
- images (URLs)
- ai_analysis (JSON - red flags, scores)
- ai_description (generated text)
- showing_availability
- last_synced

**Showing**
- id
- client_id
- property_id
- showingtime_id
- scheduled_time
- status (pending, confirmed, completed, cancelled)
- notes

**Agent**
- id
- email
- name
- mls_credentials (encrypted)
- showingtime_credentials (encrypted)
- default_restrictions (JSON)

---

## Integration Requirements

### MLS Access
- Research local MLS API options (RETS deprecated, RESO Web API preferred)
- May need to partner with MLS vendor or use aggregator
- Alternatives: Zillow API, Realtor.com API, or direct scraping (check ToS)

### ShowingTime
- ShowingTime API documentation access
- Agent account linkage
- OAuth or API key authentication

### AI Services
- Anthropic Claude API (for vision analysis + content generation)
- Alternatively: OpenAI GPT-4V

### Email Service
- SendGrid, Postmark, or AWS SES
- Transactional email templates
- Click tracking for analytics

---

## MVP Scope

**Phase 1 - Core Pipeline:**
1. Manual MLS data import (CSV/JSON) - defer live scraping
2. Image analysis for red flags
3. AI property descriptions
4. Email delivery to clients
5. Simple booking link (to ShowingTime directly, not integrated)

**Phase 2 - Full Automation:**
1. Live MLS integration
2. ShowingTime API integration
3. In-app booking flow
4. Agent dashboard

**Phase 3 - Enhancement:**
1. Client preference learning
2. Automated follow-ups
3. Market analysis
4. Mobile app

---

## Success Metrics

- Time saved per client (target: 2-4 hours per client)
- Showing booking rate (% of sent properties that get booked)
- Client satisfaction scores
- Red flag detection accuracy
- Agent retention/usage

---

## Open Questions

1. Which MLS system(s) to target first? (Regional consideration)
2. ShowingTime API access - is your friend already a ShowingTime user?
3. Pricing model - per client, per showing, monthly subscription?
4. Compliance - any real estate regulations around automated client communication?
5. What specific red flags are most important to detect?
6. Should clients be able to request additional properties or is it one-way?

---

## Competitive Landscape

- **Ylopo** - AI-powered lead generation, but not showing automation
- **Structurely** - AI assistant for lead follow-up
- **ShowingTime** - Booking only, no property curation
- **Zillow/Redfin** - Consumer-facing, not agent tools

**OpenHouse differentiator:** End-to-end automation from search to showing, with AI-powered quality filtering.

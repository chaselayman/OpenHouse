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

## MVP Scope (Full Feature Launch)

All features ship in v1.0:

1. Live MLS integration with scraping/API access
2. AI image analysis for red flag detection
3. AI-generated personalized property descriptions
4. Full ShowingTime API integration for automated booking
5. Client portal with email delivery and one-click booking
6. Agent dashboard
7. In-app booking flow with calendar sync
8. Client preference learning
9. Automated follow-ups
10. Market analysis tools

---

## Success Metrics

- Time saved per client (target: 2-4 hours per client)
- Showing booking rate (% of sent properties that get booked)
- Client satisfaction scores
- Red flag detection accuracy
- Agent retention/usage

---

## Pricing

### Individual Agent Plan

| Component | Price |
|-----------|-------|
| Base | $49.99/mo (includes 5 clients) |
| Additional clients | +$4.99/client/mo |
| Unlimited clients | $299/mo flat |

**Examples:**
- 5 clients = $49.99/mo
- 10 clients = $49.99 + (5 × $4.99) = $74.94/mo
- 20 clients = $49.99 + (15 × $4.99) = $124.84/mo
- Unlimited = $299/mo

### Brokerage Plan

| Component | Price |
|-----------|-------|
| Base per agent | $39.99/mo (includes 5 clients) |
| Additional clients | +$3.99/client/mo per agent |
| Unlimited clients | $249/mo per agent |
| Minimum seats | 5 agents |

**Examples (5-agent brokerage):**
- 5 clients each = 5 × $39.99 = $199.95/mo
- 10 clients each = 5 × ($39.99 + 5×$3.99) = 5 × $59.94 = $299.70/mo
- Unlimited each = 5 × $249 = $1,245/mo

### Account Restrictions (Anti-Sharing Enforcement)

Each account is technically restricted to prevent multi-agent sharing:

| Restriction | Individual | Brokerage (per seat) |
|-------------|------------|----------------------|
| ShowingTime logins | 1 | 1 per agent |
| Calendar syncs | 1 | 1 per agent |
| MLS credential sets | 1 | 1 per agent |
| Concurrent sessions | 1 | 1 per agent |
| Agent dashboard | Single view | Individual per agent |

**Why this matters:** A brokerage trying to share one Individual Unlimited account ($299/mo) would be limited to 1 ShowingTime login, 1 calendar, and 1 concurrent session—making it operationally impossible for multiple agents to use effectively.

### Pricing Strategy

| Benefit | How It Works |
|---------|--------------|
| **Low barrier to entry** | $49.99/mo for individual, $199.95/mo for brokerage—far below competitors |
| **Granular scaling** | Pay per client ($4.99 or $3.99), not locked into tiers |
| **Technical anti-sharing** | 1 ShowingTime login, 1 calendar, 1 session per account enforces proper seat purchases |
| **Clear upgrade path** | As agents grow, natural progression to more clients or unlimited |
| **Brokerage incentive** | 20% discount on base + per-client pricing, plus $50 savings on unlimited ($249 vs $299) |
| **Unlimited ceiling** | $299 individual / $249 brokerage caps costs for high-volume agents |

### Competitive Comparison

| Product | Starting Price | What It Does |
|---------|----------------|--------------|
| **OpenHouse** | **$49.99/mo** | **Full automation: MLS → AI analysis → booking** |
| ShowingTime | $15-45/mo | Booking only |
| Market Leader | $189/mo | Lead gen + CRM |
| kvCORE | $499+/mo | Full platform |
| CINC | $899+/mo | AI + lead gen |
| Ylopo | $500+/mo | AI marketing |

---

## Platform

### Delivery Method: Responsive Web Application

OpenHouse will be built as a responsive web application (mobile-friendly) using Next.js, accessible from any device with a web browser.

**Why Web App:**
- Maximum reach across all devices and browsers
- Single codebase for faster development and iteration
- No app store approval delays or gatekeepers
- Instant updates without user action
- Easy to add PWA (Progressive Web App) or native mobile wrapper later
- Real estate agents work from phones constantly—mobile-responsive is essential

**Not Chrome Extension:** Too limiting (desktop Chrome only), can't handle complex workflows, harder for agents to discover.

**Not Native Mobile App (initially):** Slower development, dual codebases (iOS/Android), app store friction. Can be added later if demand warrants.

---

## Open Questions

1. Which MLS system(s) to target first? (Regional consideration)
2. ShowingTime API access - is your friend already a ShowingTime user?
3. ~~Pricing model - per client, per showing, monthly subscription?~~ ✓ Resolved
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

---

## Research Sources

### Competitor Pricing & Features
- [HousingWire - Best Real Estate Software 2025](https://www.housingwire.com/articles/real-estate-software/)
- [The Close - Ylopo Review & Pricing](https://theclose.com/ylopo-reviews/)
- [The Close - Real Estate Software Pricing](https://theclose.com/real-estate-software/)
- [InboundREM - kvCORE Review 2025](https://inboundrem.com/kvcore-kunversion-pros-cons/)
- [Ylopo - CINC CRM Review](https://www.ylopo.com/blog/cinc-crm)
- [ShowingTime Official](https://showingtime.com/)
- [GetApp - ShowingTime Pricing](https://www.getapp.com/real-estate-property-software/a/showingtime-appointment-center/pricing/)

### MLS & Technical
- [Biz4Group - MLS Software Development Guide 2025](https://www.biz4group.com/blog/mls-software-development)
- [Clockwise - Real Estate MLS Software Development](https://clockwise.software/blog/custom-mls-software-development-guide/)
- [ShowingTime+ MLS Solutions](https://showingtimeplus.com/mls-and-associations)

### Platform & Delivery Research
- [Constellation1 - CRM with Mobile App](https://constellation1.com/front-office/crm-with-mobile-app/)
- [Rechat - Mobile-First CRM Platform](https://rechat.com/)
- [BinaryFolks - Chrome Extension for SaaS](https://binaryfolks.com/blog/chrome-extension-development-can-be-the-best-investment-for-your-saas-product/)

import { createClient } from "@/lib/supabase/client";
import type { BigDayBotContact, BigDayBotContactInsert } from "@/lib/types/database";

// CSV column mapping
const CSV_COLUMN_MAP: Record<string, keyof BigDayBotContactInsert> = {
  first_name: "first_name",
  firstname: "first_name",
  "first name": "first_name",
  last_name: "last_name",
  lastname: "last_name",
  "last name": "last_name",
  email: "email",
  "email address": "email",
  phone: "phone",
  "phone number": "phone",
  mobile: "phone",
  birthday: "birthday",
  "birth date": "birthday",
  birthdate: "birthday",
  dob: "birthday",
  wedding_anniversary: "wedding_anniversary",
  "wedding anniversary": "wedding_anniversary",
  anniversary: "wedding_anniversary",
  "wedding date": "wedding_anniversary",
  home_purchase_date: "home_purchase_date",
  "home purchase date": "home_purchase_date",
  "purchase date": "home_purchase_date",
  "closing date": "home_purchase_date",
  close_date: "home_purchase_date",
  move_in_date: "move_in_date",
  "move in date": "move_in_date",
  "move-in date": "move_in_date",
  movein: "move_in_date",
  property_address: "property_address",
  "property address": "property_address",
  address: "property_address",
  property_city: "property_city",
  "property city": "property_city",
  city: "property_city",
  property_state: "property_state",
  "property state": "property_state",
  state: "property_state",
  property_zip: "property_zip",
  "property zip": "property_zip",
  zip: "property_zip",
  zipcode: "property_zip",
  kid1_name: "kid1_name",
  "kid1 name": "kid1_name",
  "child1 name": "kid1_name",
  kid1_birthday: "kid1_birthday",
  "kid1 birthday": "kid1_birthday",
  "child1 birthday": "kid1_birthday",
  kid2_name: "kid2_name",
  "kid2 name": "kid2_name",
  "child2 name": "kid2_name",
  kid2_birthday: "kid2_birthday",
  "kid2 birthday": "kid2_birthday",
  "child2 birthday": "kid2_birthday",
  kid3_name: "kid3_name",
  "kid3 name": "kid3_name",
  kid3_birthday: "kid3_birthday",
  "kid3 birthday": "kid3_birthday",
  kid4_name: "kid4_name",
  "kid4 name": "kid4_name",
  kid4_birthday: "kid4_birthday",
  "kid4 birthday": "kid4_birthday",
  notes: "notes",
};

// Parse date string in various formats to YYYY-MM-DD
function parseDate(dateStr: string | undefined): string | null {
  if (!dateStr || dateStr.trim() === "") return null;

  const cleaned = dateStr.trim();

  // Try MM/DD/YYYY or M/D/YYYY
  const usFormat = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const usMatch = cleaned.match(usFormat);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Try YYYY-MM-DD (ISO format)
  const isoFormat = /^(\d{4})-(\d{2})-(\d{2})$/;
  if (isoFormat.test(cleaned)) {
    return cleaned;
  }

  // Try MM-DD-YYYY
  const dashFormat = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
  const dashMatch = cleaned.match(dashFormat);
  if (dashMatch) {
    const [, month, day, year] = dashMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Try to parse with Date constructor as last resort
  try {
    const date = new Date(cleaned);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  } catch {
    // Ignore parsing errors
  }

  return null;
}

// Parse CSV string to array of objects
export function parseCSV(csvString: string): Record<string, string>[] {
  const lines = csvString.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  // Parse header row
  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());

  // Parse data rows
  const data: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (values[index] !== undefined) {
        row[header] = values[index];
      }
    });
    data.push(row);
  }

  return data;
}

// Parse a single CSV line (handles quoted fields)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// Convert CSV row to BigDayBot contact
export function csvRowToContact(
  row: Record<string, string>,
  agentId: string,
  importBatchId: string
): BigDayBotContactInsert | null {
  const contact: BigDayBotContactInsert = {
    agent_id: agentId,
    first_name: "",
    import_source: "csv",
    import_batch_id: importBatchId,
  };

  // Map CSV columns to contact fields
  for (const [csvColumn, value] of Object.entries(row)) {
    const normalizedColumn = csvColumn.toLowerCase().trim();
    const contactField = CSV_COLUMN_MAP[normalizedColumn];

    if (contactField && value) {
      // Handle date fields
      if (
        contactField.includes("birthday") ||
        contactField.includes("anniversary") ||
        contactField.includes("date")
      ) {
        const parsedDate = parseDate(value);
        if (parsedDate) {
          (contact as Record<string, unknown>)[contactField] = parsedDate;
        }
      } else {
        (contact as Record<string, unknown>)[contactField] = value.trim();
      }
    }
  }

  // Validate required fields
  if (!contact.first_name || contact.first_name.trim() === "") {
    return null;
  }

  return contact;
}

// Import contacts from CSV
export async function importContactsFromCSV(
  csvString: string,
  agentId: string
): Promise<{
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}> {
  const supabase = createClient();
  const importBatchId = crypto.randomUUID();
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;

  try {
    const rows = parseCSV(csvString);

    if (rows.length === 0) {
      return {
        success: false,
        imported: 0,
        skipped: 0,
        errors: ["No data found in CSV file"],
      };
    }

    const contacts: BigDayBotContactInsert[] = [];

    for (let i = 0; i < rows.length; i++) {
      const contact = csvRowToContact(rows[i], agentId, importBatchId);
      if (contact) {
        contacts.push(contact);
      } else {
        skipped++;
        errors.push(`Row ${i + 2}: Missing required field (first_name)`);
      }
    }

    if (contacts.length === 0) {
      return {
        success: false,
        imported: 0,
        skipped,
        errors: ["No valid contacts found in CSV"],
      };
    }

    // Insert contacts in batches of 100
    const batchSize = 100;
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      const { error } = await supabase.from("bigdaybot_contacts").insert(batch);

      if (error) {
        errors.push(`Batch insert error: ${error.message}`);
      } else {
        imported += batch.length;
      }
    }

    return {
      success: imported > 0,
      imported,
      skipped,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      imported,
      skipped,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

// Get all contacts for an agent
export async function getContacts(agentId: string): Promise<BigDayBotContact[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bigdaybot_contacts")
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }

  return data || [];
}

// Get upcoming events for the next N days
export async function getUpcomingEvents(
  agentId: string,
  days: number = 30
): Promise<
  {
    contact: BigDayBotContact;
    eventType: string;
    eventDate: Date;
    yearsSince: number | null;
  }[]
> {
  const contacts = await getContacts(agentId);
  const events: {
    contact: BigDayBotContact;
    eventType: string;
    eventDate: Date;
    yearsSince: number | null;
  }[] = [];

  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + days);

  for (const contact of contacts) {
    if (contact.status !== "active") continue;

    // Check each date field
    const dateFields = [
      { field: "birthday", type: "Birthday" },
      { field: "wedding_anniversary", type: "Wedding Anniversary" },
      { field: "home_purchase_date", type: "Home Anniversary" },
      { field: "move_in_date", type: "Move-in Anniversary" },
      { field: "kid1_birthday", type: `${contact.kid1_name || "Child"}'s Birthday` },
      { field: "kid2_birthday", type: `${contact.kid2_name || "Child"}'s Birthday` },
      { field: "kid3_birthday", type: `${contact.kid3_name || "Child"}'s Birthday` },
      { field: "kid4_birthday", type: `${contact.kid4_name || "Child"}'s Birthday` },
    ];

    for (const { field, type } of dateFields) {
      const dateValue = contact[field as keyof BigDayBotContact] as string | null;
      if (!dateValue) continue;

      const originalDate = new Date(dateValue);
      const thisYearDate = new Date(
        today.getFullYear(),
        originalDate.getMonth(),
        originalDate.getDate()
      );

      // If the date has passed this year, check next year
      if (thisYearDate < today) {
        thisYearDate.setFullYear(thisYearDate.getFullYear() + 1);
      }

      // Check if within range
      if (thisYearDate <= endDate) {
        const yearsSince = field.includes("birthday")
          ? null
          : thisYearDate.getFullYear() - originalDate.getFullYear();

        events.push({
          contact,
          eventType: type,
          eventDate: thisYearDate,
          yearsSince,
        });
      }
    }
  }

  // Sort by date
  events.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());

  return events;
}

// Delete a contact
export async function deleteContact(contactId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("bigdaybot_contacts")
    .delete()
    .eq("id", contactId);

  return !error;
}

// Update a contact
export async function updateContact(
  contactId: string,
  updates: Partial<BigDayBotContact>
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("bigdaybot_contacts")
    .update(updates)
    .eq("id", contactId);

  return !error;
}

// Generate CSV template
export function generateCSVTemplate(): string {
  const headers = [
    "first_name",
    "last_name",
    "email",
    "phone",
    "birthday",
    "wedding_anniversary",
    "home_purchase_date",
    "move_in_date",
    "property_address",
    "property_city",
    "property_state",
    "property_zip",
    "kid1_name",
    "kid1_birthday",
    "kid2_name",
    "kid2_birthday",
    "notes",
  ];

  const exampleRow = [
    "John",
    "Smith",
    "john@example.com",
    "555-123-4567",
    "03/15/1985",
    "06/20/2010",
    "09/01/2022",
    "09/15/2022",
    "123 Main St",
    "Austin",
    "TX",
    "78701",
    "Emma",
    "04/22/2015",
    "Liam",
    "07/08/2018",
    "Referred by Jane Doe",
  ];

  return headers.join(",") + "\n" + exampleRow.join(",");
}

import { NextResponse } from "next/server";
import { generateCSVTemplate } from "@/lib/services/bigdaybot";

export async function GET() {
  const template = generateCSVTemplate();

  return new NextResponse(template, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=bigdaybot_contacts_template.csv",
    },
  });
}

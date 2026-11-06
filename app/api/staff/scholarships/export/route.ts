import { NextResponse } from "next/server";
import { requireStaffAbility } from "@/lib/admin-ability";

export async function GET() {
  let adminClient;
  try {
    ({ adminClient } = await requireStaffAbility("manage_scholarships"));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await adminClient
    .from("scholarships")
    .select(
      "id, name, institution_name, programme_name, destination_country, study_level, funding_type, amount, application_deadline, application_url, source_url, eligibility_notes, listing_status, is_active, last_checked_at, verified_at"
    )
    .order("created_at", { ascending: false });

  if (!data || data.length === 0) {
    return new NextResponse("No data", { status: 200 });
  }

  const headers = [
    "ID", "Name", "Institution", "Programme", "Country", "Study Level", "Funding Type", "Amount",
    "Deadline", "Application Link", "Source Link", "Eligibility Notes", "Listing Status", "Active",
    "Last Checked", "Verified At",
  ];
  const rows = (data as Record<string, unknown>[]).map((r) =>
    [
      r.id, r.name, r.institution_name, r.programme_name, r.destination_country, r.study_level,
      r.funding_type, r.amount, r.application_deadline, r.application_url, r.source_url,
      r.eligibility_notes, r.listing_status, r.is_active, r.last_checked_at, r.verified_at,
    ]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="scholarships-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

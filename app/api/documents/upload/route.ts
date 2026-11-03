import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireClientProfile } from "@/lib/client-auth";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Must match the documents.document_type check constraint in
// 20240101_initial_schema.sql — kept in sync by hand.
const ALLOWED_DOCUMENT_TYPES = [
  "transcript", "certificate", "id", "passport", "sop", "lor",
  "cv", "test_scores", "financial", "other",
];

export async function POST(request: NextRequest) {
  try {
    // client_id is derived from the session below, never trusted from the
    // form — previously any unauthenticated request could attach a file to
    // any client's record. See lib/client-auth.ts.
    const auth = await requireClientProfile();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const clientId = auth.clientId;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("document_type") as string | null;

    if (!file || !documentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!ALLOWED_DOCUMENT_TYPES.includes(documentType)) {
      return NextResponse.json({ error: "Invalid document type." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed. Use PDF, JPG, or PNG." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum 10MB." }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = file.name.split(".").pop() ?? "pdf";
    const storagePath = `${clientId}/${documentType}_${Date.now()}.${ext}`;

    const { error: storageError } = await supabaseAdmin.storage
      .from("documents")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (storageError) {
      console.error("Storage upload error:", storageError.message);
      return NextResponse.json({ error: "Upload failed: " + storageError.message }, { status: 500 });
    }

    const { data: doc, error: dbError } = await supabaseAdmin
      .from("documents")
      .insert({
        client_id: clientId,
        uploaded_by: auth.userId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
        document_type: documentType,
        status: "pending_review",
      })
      .select("id, file_name")
      .single<{ id: string; file_name: string }>();

    if (dbError) {
      console.error("DB insert error:", dbError.message);
      return NextResponse.json({ error: "Failed to save document record" }, { status: 500 });
    }

    await supabaseAdmin
      .from("client_profiles")
      .update({ documents_completed: true } as Record<string, unknown>)
      .eq("id", clientId);

    return NextResponse.json({ id: doc.id, file_name: doc.file_name }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

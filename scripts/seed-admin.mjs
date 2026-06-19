import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL || "j.oarowolo@gmail.com";
const adminPassword = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !serviceKey || !adminPassword) {
  console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_PASSWORD");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Check if user already exists
const { data: existing } = await admin.auth.admin.listUsers();
const found = existing?.users.find((u) => u.email === adminEmail);
let userId;

if (found) {
  console.log(`User ${adminEmail} already exists in Auth (id: ${found.id})`);
  userId = found.id;
} else {
  const { data: created, error } = await admin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: "Admin" },
  });
  if (error) {
    console.error("Failed to create auth user:", error.message);
    process.exit(1);
  }
  userId = created.user.id;
  console.log(`Created auth user ${adminEmail} (id: ${userId})`);
}

// Insert staff profile (upsert by id)
const { error: upsertError } = await admin
  .from("staff_profiles")
  .upsert({
    id: userId,
    full_name: "Admin",
    email: adminEmail,
    role: "super_admin",
    is_active: true,
  }, { onConflict: "id" });

if (upsertError) {
  console.error("Failed to upsert staff profile:", upsertError.message);
  process.exit(1);
}

console.log(`Staff profile created/updated for ${adminEmail} (role: super_admin)`);
console.log("Admin login should now work.");

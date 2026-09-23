// supabase.js — Live Supabase Client & Helper Functions
// ═══════════════════════════════════════════════════════════════

const SUPABASE_URL = "https://gwxuhbsneelchxxisyao.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3eHVoYnNuZWVsY2h4eGlzeWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwOTI3NjcsImV4cCI6MjEwNTY2ODc2N30.MooLXlFTFNblOw7igV7lM552sEspKmWrhBJbtJNDXAE";

// Initialize Supabase Client
let _supabaseClient = null;

function getSupabase() {
  if (_supabaseClient) return _supabaseClient;
  if (typeof window !== "undefined" && window.supabase && window.supabase.createClient) {
    _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _supabaseClient;
  }
  return null;
}

// Global helpers accessible from all HTML pages
window.SupabaseDB = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,
  getClient: getSupabase,

  // 1. Submit Student Enrollment
  async insertEnrollment(enrollmentData) {
    const client = getSupabase();
    if (!client) {
      console.warn("Supabase library not loaded yet.");
      return { data: null, error: new Error("Supabase client not loaded") };
    }
    const { data, error } = await client
      .from("enrollments")
      .insert([enrollmentData])
      .select();

    if (error) {
      console.error("❌ Supabase insert enrollment error:", error);
      throw error;
    }
    console.log("✅ Enrollment saved to Supabase:", data);
    return data;
  },

  // 2. Fetch all enrollments (for Admin Panel)
  async getEnrollments() {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client
      .from("enrollments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase get enrollments error:", error);
      return [];
    }
    return data || [];
  },

  // 3. Submit Contact Inquiry
  async insertContact(contactData) {
    const client = getSupabase();
    if (!client) return null;
    const { data, error } = await client
      .from("contacts")
      .insert([contactData])
      .select();

    if (error) {
      console.error("❌ Supabase insert contact error:", error);
      throw error;
    }
    return data;
  },

  // 4. Fetch Live Signals
  async getSignals() {
    const client = getSupabase();
    if (!client) return [];
    const { data, error } = await client
      .from("signals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase fetch signals error:", error);
      return [];
    }
    return data || [];
  },

  // 5. Post New Signal (from Admin Panel)
  async insertSignal(signalData) {
    const client = getSupabase();
    if (!client) return null;
    const { data, error } = await client
      .from("signals")
      .insert([signalData])
      .select();

    if (error) {
      console.error("❌ Supabase insert signal error:", error);
      throw error;
    }
    return data;
  }
};

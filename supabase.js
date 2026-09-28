// supabase.js — Optimized Supabase Client & Helper Functions
// ═══════════════════════════════════════════════════════════════
// OPTIMIZATIONS:
//  - Strict column selection (no SELECT *)
//  - Bounded queries with .limit() — protects DB under traffic spikes
//  - Status-filtered signals — only active signals hit the wire
//  - Event-driven readiness signal (no polling)
//  - Client singleton with null-safe early returns
// ═══════════════════════════════════════════════════════════════

const SUPABASE_URL     = "https://gwxuhbsneelchxxisyao.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3eHVoYnNuZWVsY2h4eGlzeWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwOTI3NjcsImV4cCI6MjEwNTY2ODc2N30.MooLXlFTFNblOw7igV7lM552sEspKmWrhBJbtJNDXAE";

// ── Singleton client ──────────────────────────────────────────
let _supabaseClient = null;

function getSupabase() {
  if (_supabaseClient) return _supabaseClient;
  if (typeof window !== 'undefined' && window.supabase?.createClient) {
    _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },           // no localStorage for public pages
      realtime: { params: { eventsPerSecond: 2 } } // rate-limit realtime events
    });
    return _supabaseClient;
  }
  return null;
}

// ── Global DB API ──────────────────────────────────────────────
window.SupabaseDB = {
  url:       SUPABASE_URL,
  key:       SUPABASE_ANON_KEY,
  getClient: getSupabase,

  // 1. Submit Student Enrollment
  async insertEnrollment(enrollmentData) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase client not loaded');

    const { data, error } = await client
      .from('enrollments')
      // Only insert the fields we need — strict payload shape
      .insert([{
        name:   enrollmentData.name,
        phone:  enrollmentData.phone,
        email:  enrollmentData.email  || null,
        city:   enrollmentData.city   || null,
        level:  enrollmentData.level  || null,
        course: enrollmentData.course || null,
        goal:   enrollmentData.goal   || null,
      }])
      .select('id, created_at'); // return only the minimal confirmation

    if (error) throw error;
    return data;
  },

  // 2. Fetch enrollments (Admin Panel) — bounded, column-selected
  async getEnrollments() {
    const client = getSupabase();
    if (!client) return [];

    const { data, error } = await client
      .from('enrollments')
      .select('id, name, phone, email, city, level, course, goal, created_at')
      .order('created_at', { ascending: false })
      .limit(200); // bounded — protect DB on traffic surge

    if (error) {
      console.error('❌ getEnrollments:', error.message);
      return [];
    }
    return data || [];
  },

  // 3. Submit Contact Inquiry
  async insertContact(contactData) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase client not loaded');

    const { data, error } = await client
      .from('contacts')
      .insert([{
        name:    contactData.name,
        email:   contactData.email   || null,
        phone:   contactData.phone   || null,
        subject: contactData.subject || null,
        message: contactData.message || null,
      }])
      .select('id, created_at');

    if (error) throw error;
    return data;
  },

  // 4. Fetch Live Signals — ONLY active, ONLY needed columns, BOUNDED
  async getSignals({ limit = 6, status = 'active' } = {}) {
    const client = getSupabase();
    if (!client) return [];

    const query = client
      .from('signals')
      .select('id, pair, type, entry_price, stop_loss, take_profit_1, take_profit_2, pips, notes, status, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by status if provided (reduces DB scan + payload)
    if (status) query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      console.error('❌ getSignals:', error.message);
      return [];
    }
    return data || [];
  },

  // 5. Fetch ALL signals (for admin/signals page) — still bounded
  async getAllSignals({ limit = 50 } = {}) {
    const client = getSupabase();
    if (!client) return [];

    const { data, error } = await client
      .from('signals')
      .select('id, pair, type, entry_price, stop_loss, take_profit_1, take_profit_2, pips, notes, status, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ getAllSignals:', error.message);
      return [];
    }
    return data || [];
  },

  // 6. Post New Signal (Admin Panel)
  async insertSignal(signalData) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase client not loaded');

    const { data, error } = await client
      .from('signals')
      .insert([signalData])
      .select('id, created_at');

    if (error) throw error;
    return data;
  },

  // 7. Update signal status (close/cancel)
  async updateSignalStatus(id, status) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase client not loaded');

    const { error } = await client
      .from('signals')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  },
};

// ── Event-driven readiness signal ─────────────────────────────
// Dispatch once the SupabaseDB object is mounted.
// Consumers listen for 'supabase:ready' instead of polling.
document.dispatchEvent(new CustomEvent('supabase:ready'));

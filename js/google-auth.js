// ===== GOOGLE LOGIN — Implicit flow via Supabase SDK =====
// Vanilla JS SPA = implicit flow je ispravan izbor (bez SSR, bez PKCE)
var SB_URL = 'https://iyuyhbgampbwkxlbdgvi.supabase.co';
var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5dXloYmdhbXBid2t4bGJkZ3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMDMwOTAsImV4cCI6MjA5NzU3OTA5MH0.28-mt9G-lMDr35ijigo2f5IiYrzcBZAF0Rf4Y9L4DUA';

function loginWithGoogle() {
  // SDK sa flowType: 'implicit' => vraca #access_token u hash, nema PKCE
  var client = supabase.createClient(SB_URL, SB_KEY, {
    auth: {
      flowType: 'implicit',
      detectSessionInUrl: false,
      persistSession: false
    }
  });
  client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/auth-callback.html',
      scopes: 'email profile'
    }
  });
}

window.loginWithGoogle = loginWithGoogle;

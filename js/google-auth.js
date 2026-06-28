// ===== GOOGLE LOGIN via Supabase SDK (PKCE) =====
var SB_URL = 'https://iyuyhbgampbwkxlbdgvi.supabase.co';
var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5dXloYmdhbXBid2t4bGJkZ3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMDMwOTAsImV4cCI6MjA5NzU3OTA5MH0.28-mt9G-lMDr35ijigo2f5IiYrzcBZAF0Rf4Y9L4DUA';

function loginWithGoogle() {
  // Učitaj SDK dinamički, pa pokrni OAuth — SDK će sačuvati code_verifier u localStorage
  var script = document.createElement('script');
  script.src = 'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js';
  script.onload = function() {
    var client = supabase.createClient(SB_URL, SB_KEY, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: false,
        persistSession: true
      }
    });
    client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth-callback.html',
        scopes: 'email profile'
      }
    });
  };
  script.onerror = function() {
    // Fallback: direktan redirect bez PKCE (ne radi uvek ali pokušavamo)
    alert('Ne mogu da učitam auth modul. Pokušaj da privremeno isključiš uBlock Origin za ovaj sajt.');
  };
  document.head.appendChild(script);
}

window.loginWithGoogle = loginWithGoogle;

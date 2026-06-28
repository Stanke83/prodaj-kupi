// ===== GOOGLE LOGIN via Supabase SDK (PKCE) =====
var SB_URL = 'https://iyuyhbgampbwkxlbdgvi.supabase.co';
var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5dXloYmdhbXBid2t4bGJkZ3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMDMwOTAsImV4cCI6MjA5NzU3OTA5MH0.28-mt9G-lMDr35ijigo2f5IiYrzcBZAF0Rf4Y9L4DUA';

function loginWithGoogle() {
  // Lokalni SDK — bez eksternih CDN-ova
  var script = document.createElement('script');
  script.src = '/js/vendor/supabase.min.js';
  script.onload = function() {
    var client = supabase.createClient(SB_URL, SB_KEY, {
      auth: { flowType: 'pkce', detectSessionInUrl: false, persistSession: true }
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
    alert('Greška pri učitavanju auth modula.');
  };
  document.head.appendChild(script);
}

window.loginWithGoogle = loginWithGoogle;

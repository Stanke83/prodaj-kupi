// ===== GOOGLE LOGIN via lokalni Supabase SDK =====
var SB_URL = 'https://iyuyhbgampbwkxlbdgvi.supabase.co';
var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5dXloYmdhbXBid2t4bGJkZ3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMDMwOTAsImV4cCI6MjA5NzU3OTA5MH0.28-mt9G-lMDr35ijigo2f5IiYrzcBZAF0Rf4Y9L4DUA';

async function loginWithGoogle() {
  // SDK mora biti već učitan (dodat u <head> stranice)
  var client = supabase.createClient(SB_URL, SB_KEY, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: false,
      persistSession: true,
      storage: window.sessionStorage  // koristimo sessionStorage koji opstaje tokom redirecta
    }
  });
  var result = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/auth-callback.html',
      scopes: 'email profile'
    }
  });
  if (result.error) alert('Greška: ' + result.error.message);
}

window.loginWithGoogle = loginWithGoogle;

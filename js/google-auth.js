// ===== GOOGLE LOGIN — Implicit flow via Supabase SDK =====
// Vanilla JS SPA = implicit flow je ispravan izbor (bez SSR, bez PKCE)
var SB_URL = '__SB_URL__';
var SB_KEY = '__SB_KEY__';

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

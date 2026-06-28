// ===== GOOGLE LOGIN — Ručni PKCE bez SDK =====
var SB_URL = 'https://iyuyhbgampbwkxlbdgvi.supabase.co';
var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5dXloYmdhbXBid2t4bGJkZ3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMDMwOTAsImV4cCI6MjA5NzU3OTA5MH0.28-mt9G-lMDr35ijigo2f5IiYrzcBZAF0Rf4Y9L4DUA';

function base64url(bytes) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(bytes)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function loginWithGoogle() {
  // Generišemo code_verifier i code_challenge (PKCE S256)
  var verifierBytes = crypto.getRandomValues(new Uint8Array(32));
  var verifier = base64url(verifierBytes);

  var challengeBytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  var challenge = base64url(challengeBytes);

  // Čuvamo verifier — auth-callback će ga pročitati
  localStorage.setItem('pkce_verifier', verifier);

  var redirectTo = encodeURIComponent(window.location.origin + '/auth-callback.html');
  window.location.href = SB_URL + '/auth/v1/authorize' +
    '?provider=google' +
    '&redirect_to=' + redirectTo +
    '&scopes=email%20profile' +
    '&code_challenge=' + challenge +
    '&code_challenge_method=S256';
}

window.loginWithGoogle = loginWithGoogle;

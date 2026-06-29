// ===== GOOGLE LOGIN — forsirani implicit flow =====
var SB_URL = 'https://iyuyhbgampbwkxlbdgvi.supabase.co';

function loginWithGoogle() {
  var redirectTo = window.location.origin + '/auth-callback.html';
  // response_type=token forsira implicit flow — Supabase vraca #access_token
  // bez PKCE, bez code_verifier problema
  var url = SB_URL + '/auth/v1/authorize'
    + '?provider=google'
    + '&redirect_to=' + encodeURIComponent(redirectTo)
    + '&scopes=email%20profile'
    + '&response_type=token';
  window.location.href = url;
}

window.loginWithGoogle = loginWithGoogle;

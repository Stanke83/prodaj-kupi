// ===== GOOGLE LOGIN (Supabase OAuth — implicit flow) =====
var SB_ANON_URL = 'https://iyuyhbgampbwkxlbdgvi.supabase.co';

function loginWithGoogle() {
  var redirectTo = encodeURIComponent(window.location.origin + '/auth-callback.html');
  // flow_type=implicit => Supabase vraća #access_token u hash, bez PKCE code exchange
  window.location.href = SB_ANON_URL + '/auth/v1/authorize' +
    '?provider=google' +
    '&redirect_to=' + redirectTo +
    '&scopes=email%20profile' +
    '&response_type=token' +
    '&flow_type=implicit';
}

window.loginWithGoogle = loginWithGoogle;

// ===== GOOGLE LOGIN (Supabase OAuth) =====
var SB_ANON_URL = 'https://iyuyhbgampbwkxlbdgvi.supabase.co';
var GOOGLE_CLIENT_ID = '334276432993-jc6fv7d38pqr2sgvn786i5eirjd4k878.apps.googleusercontent.com';

function loginWithGoogle() {
  var redirectTo = encodeURIComponent(window.location.origin + '/auth-callback.html');
  window.location.href = SB_ANON_URL + '/auth/v1/authorize?provider=google&redirect_to=' +
    redirectTo + '&scopes=email%20profile';
}

window.loginWithGoogle = loginWithGoogle;

// ===== GOOGLE LOGIN — GSI popup (ID token flow) =====
var GOOGLE_CLIENT_ID = '334276432993-jc6fv7d38pqr2sgvn786i5eirjd4k878.apps.googleusercontent.com';
var SB_URL = 'https://iyuyhbgampbwkxlbdgvi.supabase.co';
var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI'
  + 'sInJlZiI6Iml5dXloYmdhbXBid2t4bGJkZ3ZpIiwicm9sZSI6ImFub24iLCJ'
  + 'pYXQiOjE3ODIwMDMwOTAsImV4cCI6MjA5NzU3OTA5MH0.28-mt9G-lMDr35ijigo2f5IiYrzcBZAF0Rf4Y9L4DUA';

function loginWithGoogle() {
  if (window.google && window.google.accounts) {
    doGoogleLogin();
    return;
  }
  var s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.onload = doGoogleLogin;
  s.onerror = function() { showToast('Ne mogu učitati Google login.', 'error'); };
  document.head.appendChild(s);
}

function doGoogleLogin() {
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: onGoogleToken,
    auto_select: false,
    cancel_on_tap_outside: true,
    use_fedcm_for_prompt: false
  });
  // Prikaži Google popup
  google.accounts.id.prompt(function(n) {
    // Ako One Tap nije prikazan, otvori popup prozor
    if (n.isNotDisplayed() || n.isSkippedMoment()) {
      google.accounts.id.renderButton(
        document.getElementById('google-btn-hidden'),
        { theme: 'outline', size: 'large' }
      );
      document.getElementById('google-btn-hidden').querySelector('div[role=button]').click();
    }
  });
}

async function onGoogleToken(resp) {
  try {
    // ID token je JWT — dekodujemo payload
    var parts = resp.credential.split('.');
    var payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));
    var email = payload.email;
    var name = payload.name || email.split('@')[0];
    if (!email) throw new Error('Email nije dostupan');
    await saveGoogleUser(email, name);
  } catch(e) {
    showToast('Greška: ' + e.message, 'error');
  }
}

async function saveGoogleUser(email, name) {
  email = email.toLowerCase().trim();
  var h = {'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json'};
  var chk = await fetch(SB_URL+'/rest/v1/users?email=eq.'+encodeURIComponent(email), {headers:h});
  var existing = await chk.json();
  var user;
  if (existing && existing.length > 0) {
    user = existing[0];
  } else {
    var ins = await fetch(SB_URL+'/rest/v1/users', {
      method:'POST',
      headers:Object.assign({},h,{'Prefer':'return=representation'}),
      body:JSON.stringify({name:name,email:email,pass:'g_'+Math.random().toString(36).slice(2),city:'',phone:''})
    });
    var rows = await ins.json();
    user = rows && rows[0];
  }
  if (!user) throw new Error('Nije moguće kreirati nalog.');
  localStorage.setItem('pk_session', JSON.stringify({
    id:user.id, name:user.name, email:user.email, city:user.city||'', phone:user.phone||''
  }));
  var next = localStorage.getItem('pk_login_next') || 'index.html';
  localStorage.removeItem('pk_login_next');
  window.location.replace(next);
}

window.loginWithGoogle = loginWithGoogle;

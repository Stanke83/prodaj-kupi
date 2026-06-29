// ===== GOOGLE LOGIN — direktno Google Identity Services (bez Supabase OAuth) =====
var GOOGLE_CLIENT_ID = '334276432993-jc6fv7d38pqr2sgvn786i5eirjd4k878.apps.googleusercontent.com';
var SB_URL = 'https://iyuyhbgampbwkxlbdgvi.supabase.co';
var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI'
  + 'sInJlZiI6Iml5dXloYmdhbXBid2t4bGJkZ3ZpIiwicm9sZSI6ImFub24iLCJ'
  + 'pYXQiOjE3ODIwMDMwOTAsImV4cCI6MjA5NzU3OTA5MH0.28-mt9G-lMDr35ijigo2f5IiYrzcBZAF0Rf4Y9L4DUA';

function loginWithGoogle() {
  // Učitaj Google Identity Services skriptu
  if (window.google && window.google.accounts) {
    startGoogleLogin();
    return;
  }
  var script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.onload = startGoogleLogin;
  script.onerror = function() { alert('Ne mogu da učitam Google login. Proveri internet vezu.'); };
  document.head.appendChild(script);
}

function startGoogleLogin() {
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleToken,
    auto_select: false,
    cancel_on_tap_outside: true
  });
  google.accounts.id.prompt(function(notification) {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      // Fallback: popup
      var client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: function(resp) {
          if (resp.error) { alert('Google login greška: ' + resp.error); return; }
          fetchGoogleUser(resp.access_token);
        }
      });
      client.requestAccessToken();
    }
  });
}

async function handleGoogleToken(response) {
  // response.credential je JWT ID token
  var idToken = response.credential;
  // Dekodujemo JWT payload (base64)
  try {
    var payload = JSON.parse(atob(idToken.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
    var email = payload.email;
    var name = payload.name || email.split('@')[0];
    if (!email) throw new Error('Email nije dostupan');
    await createOrGetUser(email, name);
  } catch(e) {
    alert('Greška pri obradi Google tokena: ' + e.message);
  }
}

async function fetchGoogleUser(accessToken) {
  try {
    var r = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': 'Bearer ' + accessToken }
    });
    var ud = await r.json();
    if (!ud.email) throw new Error('Email nije dostupan');
    await createOrGetUser(ud.email, ud.name || ud.email.split('@')[0]);
  } catch(e) {
    alert('Greška: ' + e.message);
  }
}

async function createOrGetUser(email, name) {
  email = email.toLowerCase().trim();
  var headers = {'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json'};
  try {
    var chk = await fetch(SB_URL+'/rest/v1/users?email=eq.'+encodeURIComponent(email), {headers:headers});
    var existing = await chk.json();
    var user;
    if (existing && existing.length > 0) {
      user = existing[0];
    } else {
      var ins = await fetch(SB_URL+'/rest/v1/users', {
        method:'POST',
        headers:Object.assign({},headers,{'Prefer':'return=representation'}),
        body:JSON.stringify({name:name,email:email,pass:'google_'+Math.random().toString(36).slice(2,10),city:'',phone:''})
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
  } catch(e) {
    alert('Greška pri prijavi: ' + e.message);
  }
}

window.loginWithGoogle = loginWithGoogle;

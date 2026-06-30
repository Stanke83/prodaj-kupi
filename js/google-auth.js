// ===== GOOGLE LOGIN — cisti GSI ID token flow, BEZ redirect fallbacka =====
var GOOGLE_CLIENT_ID = '334276432993-jc6fv7d38pqr2sgvn786i5eirjd4k878.apps.googleusercontent.com';
var SB_URL = 'https://iyuyhbgampbwkxlbdgvi.supabase.co';
var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI'
  + 'sInJlZiI6Iml5dXloYmdhbXBid2t4bGJkZ3ZpIiwicm9sZSI6ImFub24iLCJ'
  + 'pYXQiOjE3ODIwMDMwOTAsImV4cCI6MjA5NzU3OTA5MH0.28-mt9G-lMDr35ijigo2f5IiYrzcBZAF0Rf4Y9L4DUA';

var gsiInitialized = false;

function initGSI() {
  if (gsiInitialized) return;
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: onGoogleToken,
    auto_select: false,
    cancel_on_tap_outside: true,
    use_fedcm_for_prompt: true
  });
  gsiInitialized = true;
}

function loginWithGoogle() {
  if (window.google && window.google.accounts) {
    initGSI();
    showGoogleButtonModal();
    return;
  }
  var s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.onload = function() { initGSI(); showGoogleButtonModal(); };
  s.onerror = function() { showToast('Ne mogu učitati Google login.', 'error'); };
  document.head.appendChild(s);
}

// Prikazuje pravo Google dugme u malom modalu — korisnik klikne NA Google dugme (ne na nas fallback)
function showGoogleButtonModal() {
  var existing = document.getElementById('googleAuthModal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'googleAuthModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = '<div style="background:#fff;padding:32px;border-radius:16px;text-align:center;max-width:320px;">' +
    '<p style="margin-bottom:16px;font-family:Inter,sans-serif;font-weight:600;color:#111;">Prijavi se sa Google nalogom</p>' +
    '<div id="gsiBtnContainer"></div>' +
    '<button onclick="document.getElementById(\'googleAuthModal\').remove()" style="margin-top:16px;background:none;border:none;color:#6b7280;cursor:pointer;font-size:.85rem;">Otkaži</button>' +
    '</div>';
  document.body.appendChild(modal);

  google.accounts.id.renderButton(
    document.getElementById('gsiBtnContainer'),
    { theme: 'filled_blue', size: 'large', text: 'signin_with', width: 260 }
  );
}

async function onGoogleToken(resp) {
  var modal = document.getElementById('googleAuthModal');
  if (modal) modal.remove();
  try {
    var parts = resp.credential.split('.');
    var payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));
    if (!payload.email) throw new Error('Email nije dostupan');
    await saveGoogleUser(payload.email, payload.name || payload.email.split('@')[0]);
  } catch(e) {
    showToast('Greška: ' + e.message, 'error');
  }
}

async function saveGoogleUser(email, name) {
  email = email.toLowerCase().trim();
  var h = {'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json'};
  var chk = await fetch(SB_URL+'/rest/v1/users?email=eq.'+encodeURIComponent(email), {headers:h});
  var existing = await chk.json();
  var user = existing && existing.length > 0 ? existing[0] : null;
  if (!user) {
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

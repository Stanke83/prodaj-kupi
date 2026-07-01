// ===== SHARED HEADER =====
function renderHeader() {
  var user = SESSION.get();
  var el = document.getElementById('headerActions');
  if (!el) return;
  if (user) {
    el.innerHTML =
      '<a href="postavi-oglas.html" class="btn btn--primary btn--sm">+ Postavi oglas</a>' +
      '<a href="poruke.html" class="btn btn--outline btn--sm" title="Poruke" id="msgBtn">💬</a>' +
      '<a href="profil.html" class="user-pill">' +
        '<div class="user-pill__avatar">' + escHtml(user.name.charAt(0).toUpperCase()) + '</div>' +
        '<span>' + escHtml(user.name.split(' ')[0]) + '</span>' +
      '</a>';
    // Unread message count
    sbFetch && sbFetch('messages?to_email=eq.' + encodeURIComponent(user.email) + '&read=eq.false&select=id&limit=99')
      .then(function(rows) {
        var count = (rows||[]).length;
        var btn = document.getElementById('msgBtn');
        if (btn && count > 0) btn.innerHTML = '💬 <span style="background:#ef4444;color:#fff;font-size:.6rem;font-weight:700;padding:1px 5px;border-radius:10px;vertical-align:top">' + (count>9?'9+':count) + '</span>';
      }).catch(function(){});
    // Notif bell
    if (typeof renderNotifBell === 'function') renderNotifBell(user.email);
    // Proveri oglase koji ističu
    checkExpiringAds(user);
  } else {
    el.innerHTML =
      '<button class="btn btn--outline btn--sm" onclick="openLoginModal()">Prijavi se</button>' +
      '<button class="btn btn--primary btn--sm" onclick="openRegModal()">Registruj se</button>';
  }
}

function injectAuthModals() {
  if (document.getElementById('regModal')) return;
  document.body.insertAdjacentHTML('beforeend',
  '<div class="modal-overlay" id="regModal">' +
    '<div class="modal">' +
      '<button class="modal__close" onclick="closeModal(\'regModal\')">✕</button>' +
      '<h2>Registracija</h2>' +
      '<p class="modal__sub">Besplatno. Radi sa svih uređaja.</p>' +
      // Google button
      '<button onclick="googleLogin()" style="width:100%;padding:11px;border:1.5px solid var(--gray-200);border-radius:8px;background:#fff;display:flex;align-items:center;justify-content:center;gap:10px;font-size:.93rem;font-weight:600;cursor:pointer;margin-bottom:16px;font-family:var(--font);transition:border-color .15s" onmouseover="this.style.borderColor=\'#4285f4\'" onmouseout="this.style.borderColor=\'var(--gray-200)\'">' +
        '<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/><path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/><path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/><path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/></svg>' +
        'Nastavi sa Google' +
      '</button>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px"><div style="flex:1;height:1px;background:var(--gray-200)"></div><span style="font-size:.78rem;color:var(--gray-400)">ili</span><div style="flex:1;height:1px;background:var(--gray-200)"></div></div>' +
      '<div class="form-group"><label>Ime i prezime <span class="req">*</span></label>' +
        '<input type="text" id="regName" placeholder="Marko Marković" autocomplete="name" autocapitalize="words"/></div>' +
      '<div class="form-group"><label>Email <span class="req">*</span></label>' +
        '<input type="email" id="regEmail" placeholder="email@primer.com" autocomplete="email" autocapitalize="none" autocorrect="off" spellcheck="false" inputmode="email"/></div>' +
      '<div class="form-group"><label>Lozinka <span class="req">*</span></label>' +
        '<input type="password" id="regPass" placeholder="Min. 6 karaktera" autocomplete="new-password"/></div>' +
      '<div class="form-group"><label>Grad</label>' +
        '<select id="regCity"><option value="">— Izaberi grad —</option>' + ALL_CITIES.map(function(c){return '<option>'+c+'</option>';}).join('') + '</select></div>' +
      '<div class="form-group"><label>Telefon</label>' +
        '<input type="tel" id="regPhone" placeholder="064 123 4567" autocomplete="tel" inputmode="tel"/></div>' +
      '<div id="regError" class="form-error"></div>' +
      '<button class="btn btn--primary btn--full" id="regBtn" onclick="handleRegister()">Registruj se besplatno</button>' +
      '<p class="modal__footer">Već imaš nalog? <a href="#" onclick="switchModal(\'regModal\',\'loginModal\')">Prijavi se</a></p>' +
    '</div>' +
  '</div>' +

  '<div class="modal-overlay" id="loginModal">' +
    '<div class="modal">' +
      '<button class="modal__close" onclick="closeModal(\'loginModal\')">✕</button>' +
      '<h2>Prijava</h2>' +
      // Google button
      '<button onclick="googleLogin()" style="width:100%;padding:11px;border:1.5px solid var(--gray-200);border-radius:8px;background:#fff;display:flex;align-items:center;justify-content:center;gap:10px;font-size:.93rem;font-weight:600;cursor:pointer;margin-bottom:16px;font-family:var(--font);transition:border-color .15s" onmouseover="this.style.borderColor=\'#4285f4\'" onmouseout="this.style.borderColor=\'var(--gray-200)\'">' +
        '<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/><path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/><path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/><path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7z"/></svg>' +
        'Prijavi se sa Google' +
      '</button>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px"><div style="flex:1;height:1px;background:var(--gray-200)"></div><span style="font-size:.78rem;color:var(--gray-400)">ili</span><div style="flex:1;height:1px;background:var(--gray-200)"></div></div>' +
      '<div class="form-group"><label>Email</label>' +
        '<input type="email" id="loginEmail" placeholder="email@primer.com" autocomplete="email" autocapitalize="none" autocorrect="off" spellcheck="false" inputmode="email" onkeydown="if(event.key===\'Enter\')document.getElementById(\'loginPass\').focus()"/></div>' +
      '<div class="form-group">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
          '<label style="margin:0">Lozinka</label>' +
          '<a href="#" onclick="event.preventDefault();switchModal(\'loginModal\',\'resetModal\')" style="font-size:.8rem;color:var(--green);font-weight:600">Zaboravljena lozinka?</a>' +
        '</div>' +
        '<input type="password" id="loginPass" placeholder="Lozinka" autocomplete="current-password" onkeydown="if(event.key===\'Enter\')handleLogin()"/>' +
      '</div>' +
      '<div id="loginError" class="form-error"></div>' +
      '<button class="btn btn--primary btn--full" id="loginBtn" onclick="handleLogin()">Prijavi se</button>' +
      '<p class="modal__footer">Nemaš nalog? <a href="#" onclick="switchModal(\'loginModal\',\'regModal\')">Registruj se</a></p>' +
    '</div>' +
  '</div>' +

  '<div class="modal-overlay" id="resetModal">' +
    '<div class="modal">' +
      '<button class="modal__close" onclick="closeModal(\'resetModal\')">✕</button>' +
      '<div style="text-align:center;margin-bottom:20px"><div style="font-size:2.5rem;margin-bottom:10px">🔑</div>' +
        '<h2>Resetuj lozinku</h2><p class="modal__sub">Unesi email — postavi novu lozinku.</p></div>' +
      '<div class="form-group"><label>Email adresa</label>' +
        '<input type="email" id="resetEmail" placeholder="email@primer.com" autocomplete="email" autocapitalize="none" autocorrect="off" spellcheck="false" inputmode="email" onkeydown="if(event.key===\'Enter\')checkResetEmail()"/></div>' +
      '<div id="resetError" class="form-error"></div>' +
      '<button class="btn btn--primary btn--full" id="resetBtn" onclick="checkResetEmail()">Nastavi</button>' +
      '<p class="modal__footer"><a href="#" onclick="switchModal(\'resetModal\',\'loginModal\')">← Nazad na prijavu</a></p>' +
    '</div>' +
  '</div>' +

  '<div class="modal-overlay" id="resetNewModal">' +
    '<div class="modal">' +
      '<button class="modal__close" onclick="closeModal(\'resetNewModal\')">✕</button>' +
      '<div style="text-align:center;margin-bottom:20px"><div style="font-size:2.5rem;margin-bottom:10px">🔒</div>' +
        '<h2>Nova lozinka</h2><p class="modal__sub" id="resetNewSub"></p></div>' +
      '<div class="form-group"><label>Nova lozinka <span class="req">*</span></label>' +
        '<input type="password" id="resetNewPass" placeholder="Min. 6 karaktera" autocomplete="new-password" onkeydown="if(event.key===\'Enter\')document.getElementById(\'resetConfPass\').focus()"/></div>' +
      '<div class="form-group"><label>Potvrdi lozinku <span class="req">*</span></label>' +
        '<input type="password" id="resetConfPass" placeholder="Ponovi lozinku" autocomplete="new-password" onkeydown="if(event.key===\'Enter\')handleResetPassword()"/></div>' +
      '<div id="resetNewError" class="form-error"></div>' +
      '<button class="btn btn--primary btn--full" id="resetNewBtn" onclick="handleResetPassword()">Sačuvaj novu lozinku</button>' +
    '</div>' +
  '</div>'
  );

  document.querySelectorAll('.modal-overlay').forEach(function(ov) {
    ov.addEventListener('click', function(e) { if (e.target === ov) closeAllModals(); });
  });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeAllModals(); });
}

function openRegModal()   { injectAuthModals(); closeAllModals(); openModal('regModal'); }
function openLoginModal() { injectAuthModals(); closeAllModals(); openModal('loginModal'); }
function switchModal(a,b) { closeModal(a); openModal(b); }

function googleLogin() {
  var next = window.location.href;
  localStorage.setItem('pk_login_next', next);
  if (typeof loginWithGoogle === 'function') {
    loginWithGoogle();
  } else {
    showToast('Google login modul nije učitan.', 'error');
  }
}

function setBtnLoading(id, loading, text) {
  var btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? '⏳ Molimo sačekaj...' : text;
}

function handleRegister() {
  var name  = document.getElementById('regName').value.trim();
  var email = document.getElementById('regEmail').value.trim().toLowerCase().replace(/\s+/g,'');
  var pass  = document.getElementById('regPass').value;
  var city  = document.getElementById('regCity').value;
  var phone = document.getElementById('regPhone').value.trim();
  var err   = document.getElementById('regError');
  err.textContent = '';
  if (!name||!email||!pass){err.textContent='Popuni obavezna polja.';return;}
  if (pass.length<6){err.textContent='Lozinka mora imati min. 6 karaktera.';return;}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){err.textContent='Unesi ispravnu email adresu.';return;}
  setBtnLoading('regBtn',true,'Registruj se besplatno');
  SB.register(name,email,pass,city,phone).then(function(user){
    closeAllModals(); renderHeader();
    showToast('Dobrodošao/la, '+user.name.split(' ')[0]+'! 🎉');
    var next=new URLSearchParams(window.location.search).get('next');
    if(next) window.location.href=next;
  }).catch(function(e){
    err.textContent=e.message;
    setBtnLoading('regBtn',false,'Registruj se besplatno');
  });
}

function handleLogin() {
  var email = document.getElementById('loginEmail').value.trim().toLowerCase().replace(/\s+/g,'');
  var pass  = document.getElementById('loginPass').value.trim();
  var err   = document.getElementById('loginError');
  err.style.color=''; err.textContent='';
  if(!email||!pass){err.textContent='Unesi email i lozinku.';return;}
  setBtnLoading('loginBtn',true,'Prijavi se');
  SB.login(email,pass).then(function(user){
    closeAllModals(); renderHeader();
    showToast('Dobrodošli, '+user.name.split(' ')[0]+'!');
    var next=new URLSearchParams(window.location.search).get('next');
    if(next) window.location.href=next;
    else if(typeof renderHome==='function') renderHome();
    else if(typeof renderResults==='function') renderResults();
  }).catch(function(e){
    err.textContent=e.message;
    setBtnLoading('loginBtn',false,'Prijavi se');
  });
}

var _resetEmail=null;
function checkResetEmail() {
  var email=document.getElementById('resetEmail').value.trim().toLowerCase().replace(/\s+/g,'');
  var err=document.getElementById('resetError'); err.textContent='';
  if(!email){err.textContent='Unesi email adresu.';return;}
  setBtnLoading('resetBtn',true,'Nastavi');
  SB.getUserByEmail(email).then(function(rows){
    if(!rows||!rows.length) throw new Error('Ne postoji nalog sa ovom email adresom.');
    _resetEmail=email;
    document.getElementById('resetNewSub').textContent='Nova lozinka za: '+email;
    document.getElementById('resetNewPass').value='';
    document.getElementById('resetConfPass').value='';
    document.getElementById('resetNewError').textContent='';
    switchModal('resetModal','resetNewModal');
    setTimeout(function(){document.getElementById('resetNewPass').focus();},300);
  }).catch(function(e){err.textContent=e.message;})
  .finally(function(){setBtnLoading('resetBtn',false,'Nastavi');});
}

function handleResetPassword() {
  var newPass=document.getElementById('resetNewPass').value;
  var confPass=document.getElementById('resetConfPass').value;
  var err=document.getElementById('resetNewError'); err.textContent='';
  if(!newPass){err.textContent='Unesi novu lozinku.';return;}
  if(newPass.length<6){err.textContent='Min. 6 karaktera.';return;}
  if(newPass!==confPass){err.textContent='Lozinke se ne poklapaju.';return;}
  if(!_resetEmail){err.textContent='Greška — pokušaj ponovo.';return;}
  setBtnLoading('resetNewBtn',true,'Sačuvaj novu lozinku');
  SB.resetPassword(_resetEmail,newPass).then(function(){
    _resetEmail=null; closeAllModals();
    showToast('Lozinka je promenjena! ✅');
    setTimeout(function(){
      openLoginModal();
      var e=document.getElementById('loginError');
      if(e){e.style.color='var(--green)';e.textContent='✅ Lozinka promenjena — prijavi se.';}
    },400);
  }).catch(function(e){err.textContent=e.message;setBtnLoading('resetNewBtn',false,'Sačuvaj novu lozinku');});
}

// ===== PROVERA OGLASA KOJI ISTIČU =====
function checkExpiringAds(user) {
  if (!user || !sbFetch) return;
  // Samo jednom po sesiji (čuvamo u sessionStorage)
  var key = 'pk_expiry_check_' + new Date().toDateString();
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');

  var now = new Date();
  var in7 = new Date(now.getTime() + 7*24*60*60*1000).toISOString();
  var in3 = new Date(now.getTime() + 3*24*60*60*1000).toISOString();

  sbFetch('ads?user_email=eq.' + encodeURIComponent(user.email) +
    '&status=eq.approved' +
    '&expired_at=lt.' + in7 +
    '&expired_at=gt.' + now.toISOString() +
    '&select=id,title,expired_at&limit=20'
  ).then(function(ads) {
    if (!ads || !ads.length) return;
    ads.forEach(function(ad) {
      var exp = new Date(ad.expired_at);
      var daysLeft = Math.ceil((exp - now) / (24*60*60*1000));
      var urgency = daysLeft <= 3 ? '🔴' : '🟡';
      var msg = urgency + ' Oglas "' + ad.title.slice(0,40) + (ad.title.length>40?'…':'') +
        '" ističe za ' + daysLeft + (daysLeft===1?' dan':' dana') + '.';

      // Dodaj in-app notifikaciju samo ako već ne postoji slična
      var notifKey = 'expiry_notif_' + ad.id + '_' + daysLeft;
      if (localStorage.getItem(notifKey)) return;
      localStorage.setItem(notifKey, '1');

      if (typeof Notifs !== 'undefined') {
        Notifs.add(
          user.email,
          'ad_expiring',
          daysLeft <= 3 ? '⚠️ Oglas uskoro ističe!' : '📅 Oglas ističe za nedelju dana',
          msg,
          'profil.html#oglasi'
        );
      }
    });
    if (typeof renderNotifBell === 'function') renderNotifBell(user.email);
  }).catch(function(){});
}

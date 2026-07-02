// ===== UTILS (globalne funkcije koje sve stranice koriste) =====
function uid() { return Math.random().toString(36).slice(2,9) + Date.now().toString(36); }

function escHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function timeAgo(ts) {
  if (!ts) return '';
  var d = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (d < 60)    return 'upravo';
  if (d < 3600)  return 'pre ' + Math.floor(d/60) + ' min';
  if (d < 86400) return 'pre ' + Math.floor(d/3600) + ' h';
  if (d < 86400*7) return 'pre ' + Math.floor(d/86400) + ' dana';
  return new Date(ts).toLocaleDateString('sr-RS');
}


function daysLeft(expiredAt) {
  if (!expiredAt) return null;
  var diff = new Date(expiredAt).getTime() - Date.now();
  var days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0)  return '<span style="color:#dc2626;font-weight:600">Istekao</span>';
  if (days <= 3)  return '<span style="color:#f59e0b;font-weight:600">⚠️ Ističe za ' + days + ' dan' + (days===1?'':'a') + '</span>';
  if (days <= 7)  return '<span style="color:#f59e0b">Ističe za ' + days + ' dana</span>';
  return '<span style="color:var(--gray-400)">Ističe za ' + days + ' dana</span>';
}
var EUR_RATE = 117.3; // RSD za 1 EUR
function fmtPrice(ad) {
  var price = ad.price || 0;
  if (!price) return '<span class="price--ask">Cena na upit</span>';
  var eur = Math.round(price / EUR_RATE);
  return Number(price).toLocaleString('sr-RS') + ' <small>RSD</small>' +
    ' <small style="color:var(--gray-400)">(≈ ' + eur.toLocaleString('sr-RS') + ' €)</small>';
}

function showToast(msg, type) {
  type = type || 'success';
  var t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = 'toast toast--' + type + ' show';
  clearTimeout(t._timer);
  t._timer = setTimeout(function() { t.classList.remove('show'); }, 3400);
}

function openModal(id)  {
  var el = document.getElementById(id);
  if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  var el = document.getElementById(id);
  if (el) { el.classList.remove('active'); document.body.style.overflow = ''; }
}
function closeAllModals() {
  document.querySelectorAll('.modal-overlay.active').forEach(function(m) { m.classList.remove('active'); });
  document.body.style.overflow = '';
}

var EMOJI = {
  'Elektronika':'📱','Mobilni telefoni':'📱','Kompjuteri':'💻',
  'Automobili':'🚗','Motocikli':'🏍️','Bicikli':'🚴',
  'Nekretnine':'🏠','Nekretnine izdavanje':'🏠',
  'Odeća i obuća':'👗','Nameštaj':'🛋️','Kućni aparati':'🏠',
  'Sport':'⚽','Knjige':'📚','Muzički instrumenti':'🎸',
  'Igračke':'🧸','Kućni ljubimci':'🐶','Alati':'🔧',
  'Poljoprivreda':'🌾','Usluge':'🛠️','Ostalo':'📦'
};

var ALL_CITIES = ['Beograd','Novi Sad','Niš','Kragujevac','Subotica','Zrenjanin','Pančevo',
  'Čačak','Novi Pazar','Kraljevo','Leskovac','Smederevo','Vranje','Valjevo','Šabac',
  'Užice','Požarevac','Jagodina','Kikinda','Sombor','Pirot','Zaječar','Bor','Ostalo'];

var ALL_CATS = ['Elektronika','Mobilni telefoni','Kompjuteri','Automobili','Motocikli','Bicikli',
  'Nekretnine','Nekretnine izdavanje','Odeća i obuća','Nameštaj','Kućni aparati','Sport',
  'Knjige','Muzički instrumenti','Igračke','Kućni ljubimci','Alati','Poljoprivreda','Usluge','Ostalo'];

// Favoriti se i dalje čuvaju lokalno (brže, ne trebaju server)
var LOCAL_FAVS = {
  get: function() { try { return JSON.parse(localStorage.getItem('pk_favs')||'[]'); } catch(e){return[];} },
  set: function(a) { localStorage.setItem('pk_favs', JSON.stringify(a)); },
  has: function(id) { return this.get().indexOf(id) > -1; },
  toggle: function(id) {
    var favs = this.get();
    var idx = favs.indexOf(id);
    if (idx > -1) favs.splice(idx,1); else favs.push(id);
    this.set(favs);
    return idx === -1;
  },
  // Učitaj iz baze i spoji sa lokalnim
  syncFromDB: function(userEmail) {
    return SB.getFavorites(userEmail).then(function(dbIds) {
      var local = LOCAL_FAVS.get();
      // Spoji lokalne i DB favoriti
      var merged = Array.from(new Set(local.concat(dbIds)));
      LOCAL_FAVS.set(merged);
      // Upload lokalnih koji nisu u DB
      var toUpload = local.filter(function(id){ return dbIds.indexOf(id) === -1; });
      toUpload.forEach(function(id){ SB.addFavorite(userEmail, id).catch(function(){}); });
      return merged;
    }).catch(function(){ return LOCAL_FAVS.get(); });
  }
};

// ===== SHARED LINK HELPERS =====
function buildMessageLink(adId, adTitle, toEmail, toName) {
  return 'poruke.html?adId=' + encodeURIComponent(adId) +
    '&adTitle=' + encodeURIComponent(adTitle) +
    '&to=' + encodeURIComponent(toEmail) +
    '&toName=' + encodeURIComponent(toName);
}
window.buildMessageLink = buildMessageLink;

// ===== SHARED: adCard + openDetail =====

function adCard(ad) {
  var photos = ad.photos || [];
  var thumb = photos.length
    ? '<img src="' + photos[0] + '" alt="' + escHtml(ad.title) + '" loading="lazy"/>'
    : (EMOJI[ad.category] || '📦');
  var isFav = LOCAL_FAVS.has(ad.id);
  return '<a href="oglas.html?id=' + ad.id + '" class="listing-card" data-adid="' + ad.id + '">' +
    '<div class="listing-card__thumb">' + thumb + '</div>' +
    '<button class="listing-card__fav ' + (isFav?'active':'') + '" data-favid="' + ad.id + '" title="Sačuvaj" onclick="event.preventDefault();event.stopPropagation();toggleFav(\'' + ad.id + '\',this)">' + (isFav?'♥':'♡') + '</button>' +
    '<div class="listing-card__body">' +
      '<span class="listing-card__category">' + escHtml(ad.category) + '</span>' +
      '<div class="listing-card__title">' + escHtml(ad.title) + '</div>' +
      '<div class="listing-card__price">' + fmtPrice(ad) + '</div>' +
      '<div class="listing-card__meta">' +
        '<span>📍 ' + escHtml(ad.city||'') + '</span>' +
        '<span>' + timeAgo(ad.created_at) + '</span>' +
      '</div>' +
    '</div>' +
  '</a>';
}

function toggleFav(id, btn) {
  var isFav = LOCAL_FAVS.toggle(id);
  btn.classList.toggle('active', isFav);
  btn.textContent = isFav ? '♥' : '♡';
  showToast(isFav ? 'Dodato u sačuvane ♥' : 'Uklonjeno iz sačuvanih', isFav ? 'success' : 'info');
}

function openDetail(id) {
  SB.getAdById(id).then(function(ad) {
    currentDetailPhotos = ad.photos || [];
    currentDetailIdx = 0;
    if (!ad) return;
    var user = SESSION.get();
    var isOwner   = user && user.email === ad.user_email;
    var canReview = user && user.email !== ad.user_email;
    var initial   = (ad.contact_name||ad.user_name||'?').charAt(0).toUpperCase();

    // Photos
    var photos = ad.photos || [];
    var photosHtml = '';
    if (photos.length) {
      photosHtml = '<div class="detail-photos">' +
        '<div class="detail-photo-main" id="dpm"><img src="' + photos[0] + '" alt="foto"/></div>' +
        (photos.length > 1
          ? '<div class="detail-photo-thumbs">' +
              photos.map(function(p,i) {
                return '<img src="' + p + '" onclick="swPh(\'' + p + '\')" class="' + (i===0?'active':'') + '"/>';
              }).join('') +
            '</div>'
          : '') +
      '</div>';
    } else {
      photosHtml = '<div class="detail-photo-main"><div class="emoji-thumb">' + (EMOJI[ad.category]||'📦') + '</div></div>';
    }

    // Extra fields
    var extras = [];
    if (ad.condition)    extras.push({l:'Stanje',       v:ad.condition});
    if (ad.subcategory)  extras.push({l:'Potkategorija',v:ad.subcategory});
    if (ad.year)         extras.push({l:'Godište',      v:ad.year});
    if (ad.mileage)      extras.push({l:'Kilometraža',  v:Number(ad.mileage).toLocaleString('sr-RS')+' km'});
    if (ad.size)         extras.push({l:'Veličina',     v:ad.size});
    if (ad.swap && ad.swap!=='Ne') extras.push({l:'Zamena',v:ad.swap});
    var delivery = ad.delivery || [];
    if (delivery.length) extras.push({l:'Preuzimanje',  v:delivery.join(', ')});
    extras.push({l:'Grad', v:'📍 '+escHtml(ad.city||'')+(ad.municipality?' — '+ad.municipality:'')});
    extras.push({l:'Kategorija', v:ad.category});

    // Reviews count
    SB.getReviews(ad.user_email).then(function(reviews) {
      reviews = reviews || [];
      var pos = reviews.filter(function(r){return r.type==='positive';}).length;
      var neg = reviews.filter(function(r){return r.type==='negative';}).length;

      var avail = (ad.availability||[]).join(' · ');

      document.getElementById('detailContent').innerHTML =
        '<button class="modal__close" onclick="closeModal(\'detailModal\')">✕</button>' +
        photosHtml +
        '<div class="detail-header">' +
          '<div style="flex:1">' +
            '<span class="listing-card__category">' + escHtml(ad.category) + '</span>' +
            '<h2 style="font-size:1.2rem;font-weight:800;margin-top:5px;line-height:1.3">' + escHtml(ad.title) + '</h2>' +
          '</div>' +
          '<div class="detail-price">' + fmtPrice(ad) + '</div>' +
        '</div>' +
        (ad.is_fixed ? '<p style="font-size:.78rem;color:var(--gray-400);margin-bottom:10px">Cena je fiksna</p>' : '') +
        '<div class="detail-seller">' +
          '<div class="detail-seller__avatar">' + initial + '</div>' +
          '<div class="detail-seller__info">' +
            '<strong>' + escHtml(ad.contact_name||ad.user_name) + '</strong>' +
            '<span>Objavljeno ' + timeAgo(ad.created_at) + '</span>' +
          '</div>' +
          '<a href="ocene.html?user=' + encodeURIComponent(ad.user_email) + '" class="seller-score" onclick="event.stopPropagation()">' +
            '<span class="seller-score__pos">👍 ' + pos + '</span>' +
            '<span class="seller-score__neg">👎 ' + neg + '</span>' +
          '</a>' +
        '</div>' +
        '<div class="detail-info">' +
          extras.map(function(e){
            return '<div class="detail-info-item"><label>' + escHtml(e.l) + '</label><span>' + escHtml(String(e.v)) + '</span></div>';
          }).join('') +
        '</div>' +
        '<div class="detail-desc">' + escHtml(ad.description) + '</div>' +
        '<div class="detail-contact">' +
          '<h4>Kontakt prodavca</h4>' +
          '<p>📞 ' + escHtml(ad.phone||'—') + '</p>' +
          (ad.phone2 ? '<p>📞 ' + escHtml(ad.phone2) + '</p>' : '') +
          (ad.show_email ? '<p>✉️ ' + escHtml(ad.show_email) + '</p>' : '') +
          (avail ? '<p style="font-size:.76rem;color:var(--gray-400);margin-top:5px">Dostupan: ' + escHtml(avail) + '</p>' : '') +
        '</div>' +
        '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">' +
          (canReview
            ? '<a href="poruke.html?adId=' + encodeURIComponent(ad.id) + '&adTitle=' + encodeURIComponent(ad.title) + '&to=' + encodeURIComponent(ad.user_email) + '&toName=' + encodeURIComponent(ad.contact_name||ad.user_name) + '" class="btn btn--primary btn--sm" style="flex:2" onclick="event.stopPropagation()">💬 Pošalji poruku prodavcu</a>'
            : '') +
        '</div>' +
        '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">' +
          (canReview
            ? '<a href="ocene.html?user=' + encodeURIComponent(ad.user_email) + '&adId=' + encodeURIComponent(ad.id) + '&adTitle=' + encodeURIComponent(ad.title) + '" class="btn btn--outline btn--sm" style="flex:1" onclick="event.stopPropagation()">✍️ Ostavi ocenu</a>'
            : '') +
          '<a href="ocene.html?user=' + encodeURIComponent(ad.user_email) + '" class="btn btn--gray btn--sm" style="flex:1" onclick="event.stopPropagation()">👍 Ocene</a>' +
        '</div>' +
        (isOwner
          ? '<div style="display:flex;gap:8px;margin-top:10px">' +
              '<a href="uredi-oglas.html?id=' + ad.id + '" class="btn btn--outline btn--sm" style="flex:1">✏️ Uredi</a>' +
              '<button class="btn btn--danger btn--sm" style="flex:1" onclick="delAd(\'' + ad.id + '\')">🗑️ Obriši</button>' +
            '</div>'
          : '');

      openModal('detailModal');
    });
  }).catch(function(e) {
    showToast('Greška pri otvaranju oglasa: ' + e.message, 'error');
    console.error('openDetail error:', e);
  });
}

var currentDetailPhotos = [];
var currentDetailIdx    = 0;

function swPh(src, idx) {
  currentDetailIdx = idx || 0;
  var el = document.querySelector('#dpm img');
  if (el) el.src = src;
  var dpm = document.getElementById('dpm');
  if (dpm) dpm.onclick = function() { openLightbox(currentDetailPhotos, currentDetailIdx); };
  document.querySelectorAll('.detail-photo-thumbs img').forEach(function(img) {
    img.classList.toggle('active', img.getAttribute('src') === src);
  });
}

function delAd(id) {
  if (!confirm('Sigurno obrišeš oglas?')) return;
  SB.deleteAd(id).then(function() {
    closeModal('detailModal');
    if (typeof renderHome    === 'function') renderHome();
    if (typeof renderResults === 'function') renderResults();
    showToast('Oglas obrisan.', 'info');
  }).catch(function(e) { showToast('Greška: ' + e.message, 'error'); });
}

// ===== GLOBALNI CLICK HANDLER ZA LISTING KARTICE (Firefox fix) =====
document.addEventListener('click', function(e) {
  // Fav dugme
  var favBtn = e.target.closest('[data-favid]');
  if (favBtn) {
    e.stopPropagation();
    e.preventDefault();
    toggleFav(favBtn.getAttribute('data-favid'), favBtn);
    return;
  }
  // Kartica
  var card = e.target.closest('[data-adid]');
  if (card) {
    var adId = card.getAttribute('data-adid');
    if (adId) openDetail(adId);
  }
});

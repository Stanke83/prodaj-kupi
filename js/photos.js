// ===== PHOTO MANAGER =====
// Koristi se i u postavi-oglas.html i uredi-oglas.html
// photoItems = [{previewUrl, cloudUrl, uploading, progress, error}]

var photoItems = [];

function photosInit(existingUrls) {
  photoItems = (existingUrls || []).map(function(url) {
    return { previewUrl: url, cloudUrl: url, uploading: false, progress: 100, error: false, isExisting: true };
  });
  photosRender();
}

function photosAddFiles(files) {
  var rem = 15 - photoItems.length;
  Array.from(files).filter(function(f) { return f.type.startsWith('image/'); })
    .slice(0, rem)
    .forEach(function(file) {
      var idx = photoItems.length;
      photoItems.push({ previewUrl: URL.createObjectURL(file), cloudUrl: null, uploading: true, progress: 0, error: false });
      photosRender();
      uploadToCloudinary(file,
        function(pct) { photoItems[idx].progress = pct; photosRender(); },
        function(url)  { photoItems[idx].cloudUrl = url; photoItems[idx].uploading = false; photosRender(); photosUpdateStatus(); },
        function(err)  { photoItems[idx].error = true; photoItems[idx].uploading = false; photosRender(); showToast('Upload greška: ' + err, 'error'); }
      );
    });
  photosUpdateStatus();
}

function photosRemove(i) {
  if (!photoItems[i].isExisting) URL.revokeObjectURL(photoItems[i].previewUrl);
  photoItems.splice(i, 1);
  photosRender();
  photosUpdateStatus();
}

function photosMoveFirst(i) {
  if (i === 0) return;
  var item = photoItems.splice(i, 1)[0];
  photoItems.unshift(item);
  photosRender();
  showToast('Naslovna slika promenjena ✅');
}

function photosAllUploaded() {
  return photoItems.length === 0 || photoItems.every(function(p) { return (p.cloudUrl || p.error) && !p.uploading; });
}

function photosGetUrls() {
  return photoItems.filter(function(p) { return p.cloudUrl; }).map(function(p) { return p.cloudUrl; });
}

function photosRender() {
  var grid = document.getElementById('photoGrid');
  if (!grid) return;

  if (!photoItems.length) {
    grid.innerHTML = '<p style="color:var(--gray-400);font-size:.85rem;margin-top:10px">Nema fotografija. Klikni gore da dodaš.</p>';
    return;
  }

  grid.innerHTML = photoItems.map(function(p, i) {
    var overlay = '';
    if (p.uploading) {
      overlay = '<div class="photo-thumb__uploading">' +
        '<div class="photo-thumb__bar"><div class="photo-thumb__bar-fill" style="width:' + p.progress + '%"></div></div>' +
        p.progress + '%</div>';
    } else if (p.error) {
      overlay = '<div class="photo-thumb__uploading" style="background:rgba(220,38,38,.6)">❌ Greška</div>';
    } else if (i === 0) {
      overlay = '<div class="photo-thumb__label">⭐ Naslovna</div>';
    } else {
      overlay = '<div class="photo-thumb__label photo-thumb__label--set" onclick="event.stopPropagation();photosMoveFirst(' + i + ')" title="Postavi kao naslovnu">Postavi naslovnu</div>';
    }

    return '<div class="photo-thumb" onclick="photosOpenLightbox(' + i + ')">' +
      '<img src="' + p.previewUrl + '" alt="foto ' + (i+1) + '" loading="lazy"/>' +
      overlay +
      '<button class="photo-thumb__remove" onclick="event.stopPropagation();photosRemove(' + i + ')" title="Ukloni">✕</button>' +
    '</div>';
  }).join('');
}

function photosUpdateStatus() {
  var el = document.getElementById('uploadStatus');
  if (!el) return;
  var total     = photoItems.length;
  var uploading = photoItems.filter(function(p){ return p.uploading; }).length;
  var uploaded  = photoItems.filter(function(p){ return p.cloudUrl; }).length;
  if (!total)     { el.textContent = ''; return; }
  if (uploading)  { el.textContent = '⬆️ Upload ' + uploading + ' od ' + total + ' slika...'; el.style.color = 'var(--gray-500)'; }
  else            { el.textContent = '✅ ' + uploaded + ' slika uploadovano'; el.style.color = 'var(--green)'; }
}

// ===== LIGHTBOX =====
function photosOpenLightbox(startIdx) {
  if (photoItems[startIdx] && photoItems[startIdx].uploading) return;
  var urls = photoItems.map(function(p){ return p.previewUrl; });
  if (!urls.length) return;
  var idx = startIdx || 0;

  var lb = document.createElement('div');
  lb.id = 'photosLightbox';
  lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;cursor:zoom-out';
  lb.onclick = function(e) { if (e.target === lb || e.target.id === 'lbImg') closeLightbox(); };

  function render() {
    lb.innerHTML =
      // Close
      '<button onclick="closeLightbox()" style="position:absolute;top:16px;right:20px;background:rgba(255,255,255,.15);color:#fff;border:none;width:40px;height:40px;border-radius:50%;font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>' +
      // Counter
      (urls.length > 1 ? '<div style="position:absolute;top:20px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.7);font-size:.88rem;font-weight:600">' + (idx+1) + ' / ' + urls.length + '</div>' : '') +
      // Image
      '<img id="lbImg" src="' + urls[idx] + '" style="max-width:92vw;max-height:80vh;object-fit:contain;border-radius:8px;box-shadow:0 8px 40px rgba(0,0,0,.5);cursor:default" onclick="event.stopPropagation()"/>' +
      // Thumbnails
      (urls.length > 1
        ? '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:90vw">' +
            urls.map(function(u, i) {
              return '<img src="' + u + '" onclick="event.stopPropagation();lbGoTo(' + i + ')" style="width:56px;height:56px;object-fit:cover;border-radius:6px;cursor:pointer;opacity:' + (i===idx?'1':'.5') + ';border:2px solid ' + (i===idx?'#fff':'transparent') + ';transition:all .15s"/>';
            }).join('') +
          '</div>'
        : '') +
      // Arrows
      (urls.length > 1
        ? '<button onclick="event.stopPropagation();lbGoTo(' + ((idx-1+urls.length)%urls.length) + ')" style="position:absolute;left:16px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.15);color:#fff;border:none;width:44px;height:44px;border-radius:50%;font-size:1.4rem;cursor:pointer">‹</button>' +
          '<button onclick="event.stopPropagation();lbGoTo(' + ((idx+1)%urls.length) + ')" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.15);color:#fff;border:none;width:44px;height:44px;border-radius:50%;font-size:1.4rem;cursor:pointer">›</button>'
        : '');
  }

  window.lbGoTo = function(i) { idx = i; render(); };
  window.closeLightbox = function() {
    document.body.removeChild(lb);
    document.removeEventListener('keydown', lbKeyHandler);
  };
  function lbKeyHandler(e) {
    if (e.key === 'Escape')    closeLightbox();
    if (e.key === 'ArrowLeft'  && urls.length > 1) lbGoTo((idx-1+urls.length)%urls.length);
    if (e.key === 'ArrowRight' && urls.length > 1) lbGoTo((idx+1)%urls.length);
  }
  document.addEventListener('keydown', lbKeyHandler);

  render();
  document.body.appendChild(lb);
}

// Lightbox se koristi i za prikaz oglasa (van edit mode-a)
function openLightbox(urls, startIdx) {
  photoItems = urls.map(function(u){ return {previewUrl:u, cloudUrl:u, uploading:false}; });
  photosOpenLightbox(startIdx || 0);
}

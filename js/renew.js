// ===== OBNAVLJANJE OGLASA (+30 dana) =====
function renewAd(adId, btnEl) {
  if (!confirm('Obnovi oglas za još 30 dana?')) return;
  var newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  if (btnEl) { btnEl.disabled = true; btnEl.textContent = '⏳...'; }
  SB.updateAd(adId, { expired_at: newExpiry, status: 'pending' })
    .then(function() {
      showToast('Oglas obnovljen! Čeka ponovo odobrenje. ✅');
      if (typeof loadMyAds === 'function') loadMyAds();
    })
    .catch(function(e) {
      showToast('Greška: ' + e.message, 'error');
      if (btnEl) { btnEl.disabled = false; btnEl.textContent = '🔄 Obnovi'; }
    });
}
window.renewAd = renewAd;

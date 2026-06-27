// ===== EMAIL NOTIFIKACIJE (Resend via Supabase Edge Function) =====
// Koristimo direktan Resend API iz browsera kroz proxy
var RESEND_KEY = 're_4nn9aL3S_PMuKCZ2omP51qQmEB7BKPC19';
var FROM_EMAIL = 'ProdajKupi <noreply@prodajkupi.vercel.app>';

function sendEmail(to, subject, html) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + RESEND_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject: subject, html: html })
  }).then(function(r) { return r.json(); }).catch(function(e) { console.warn('Email nije poslat:', e.message); });
}

var EmailTemplates = {
  adApproved: function(userName, adTitle, adId) {
    return {
      subject: '✅ Tvoj oglas je odobren — ' + adTitle,
      html: '<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px">' +
        '<div style="background:#1a8f4b;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">' +
          '<h1 style="color:#fff;font-size:1.4rem;margin:0">ProdajKupi</h1>' +
        '</div>' +
        '<h2 style="color:#1f2937">✅ Oglas je odobren!</h2>' +
        '<p style="color:#4b5563">Zdravo ' + userName + ',</p>' +
        '<p style="color:#4b5563">Tvoj oglas <strong>"' + adTitle + '"</strong> je pregledan i odobren. Oglas je sada vidljiv svim posetiocima sajta.</p>' +
        '<a href="https://prodaj-kupi.vercel.app" style="display:inline-block;background:#1a8f4b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">Pogledaj oglas →</a>' +
        '<p style="color:#9ca3af;font-size:.82rem;margin-top:24px">ProdajKupi — Besplatni oglasi</p>' +
      '</div>'
    };
  },

  adRejected: function(userName, adTitle, reason) {
    return {
      subject: '❌ Oglas nije odobren — ' + adTitle,
      html: '<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px">' +
        '<div style="background:#1a8f4b;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">' +
          '<h1 style="color:#fff;font-size:1.4rem;margin:0">ProdajKupi</h1>' +
        '</div>' +
        '<h2 style="color:#1f2937">❌ Oglas nije odobren</h2>' +
        '<p style="color:#4b5563">Zdravo ' + userName + ',</p>' +
        '<p style="color:#4b5563">Nažalost, tvoj oglas <strong>"' + adTitle + '"</strong> nije odobren.</p>' +
        '<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:14px 16px;margin:16px 0">' +
          '<strong style="color:#dc2626">Razlog:</strong> <span style="color:#374151">' + reason + '</span>' +
        '</div>' +
        '<p style="color:#4b5563">Možeš izmeniti oglas i ponovo ga poslati na pregled.</p>' +
        '<a href="https://prodaj-kupi.vercel.app/profil.html" style="display:inline-block;background:#1a8f4b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">Idi na moje oglase →</a>' +
        '<p style="color:#9ca3af;font-size:.82rem;margin-top:24px">ProdajKupi — Besplatni oglasi</p>' +
      '</div>'
    };
  },

  newMessage: function(userName, fromName, adTitle, messageText) {
    return {
      subject: '💬 Nova poruka od ' + fromName + ' — ' + adTitle,
      html: '<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px">' +
        '<div style="background:#1a8f4b;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">' +
          '<h1 style="color:#fff;font-size:1.4rem;margin:0">ProdajKupi</h1>' +
        '</div>' +
        '<h2 style="color:#1f2937">💬 Nova poruka!</h2>' +
        '<p style="color:#4b5563">Zdravo ' + userName + ',</p>' +
        '<p style="color:#4b5563"><strong>' + fromName + '</strong> ti je poslao poruku u vezi oglasa <strong>"' + adTitle + '"</strong>:</p>' +
        '<div style="background:#f3f4f6;border-radius:8px;padding:14px 16px;margin:16px 0;font-style:italic;color:#374151">"' + messageText + '"</div>' +
        '<a href="https://prodaj-kupi.vercel.app/poruke.html" style="display:inline-block;background:#1a8f4b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">Odgovori →</a>' +
        '<p style="color:#9ca3af;font-size:.82rem;margin-top:24px">ProdajKupi — Besplatni oglasi</p>' +
      '</div>'
    };
  },

  adExpiringSoon: function(userName, adTitle, daysLeft) {
    return {
      subject: '⚠️ Oglas ističe za ' + daysLeft + ' dana — ' + adTitle,
      html: '<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px">' +
        '<div style="background:#1a8f4b;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">' +
          '<h1 style="color:#fff;font-size:1.4rem;margin:0">ProdajKupi</h1>' +
        '</div>' +
        '<h2 style="color:#1f2937">⚠️ Oglas uskoro ističe</h2>' +
        '<p style="color:#4b5563">Zdravo ' + userName + ',</p>' +
        '<p style="color:#4b5563">Tvoj oglas <strong>"' + adTitle + '"</strong> ističe za <strong>' + daysLeft + ' dana</strong>.</p>' +
        '<p style="color:#4b5563">Obnovi oglas da ostane vidljiv još 30 dana.</p>' +
        '<a href="https://prodaj-kupi.vercel.app/profil.html" style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">Obnovi oglas →</a>' +
        '<p style="color:#9ca3af;font-size:.82rem;margin-top:24px">ProdajKupi — Besplatni oglasi</p>' +
      '</div>'
    };
  }
};

// Pošalji email notifikaciju adminu kada dođe novi oglas
function notifyAdminNewAd(adTitle, userName, userEmail) {
  return sendEmail('dushan.stanojevic@gmail.com',
    '🆕 Novi oglas čeka moderaciju — ' + adTitle,
    '<div style="font-family:Inter,sans-serif;padding:24px">' +
      '<h2>Novi oglas na moderaciji</h2>' +
      '<p><strong>Naslov:</strong> ' + adTitle + '</p>' +
      '<p><strong>Korisnik:</strong> ' + userName + ' (' + userEmail + ')</p>' +
      '<a href="https://prodaj-kupi.vercel.app/admin.html" style="display:inline-block;background:#1a8f4b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Otvori admin panel →</a>' +
    '</div>'
  );
}

window.sendEmail = sendEmail;
window.EmailTemplates = EmailTemplates;
window.notifyAdminNewAd = notifyAdminNewAd;

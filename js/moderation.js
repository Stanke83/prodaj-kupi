// ===== AI MODERACIJA TEKSTA (Claude API) =====
var ANTHROPIC_KEY = ''; // Postavlja se kroz admin

async function moderateText(title, description, category) {
  try {
    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `Analiziraj sledeći oglas sa srpskog oglasnog sajta. Odgovori SAMO u JSON formatu.

Naslov: ${title}
Kategorija: ${category}
Opis: ${description}

Proveri da li oglas:
1. Sadrži seksualni/pornografski sadržaj
2. Nudi ilegalne usluge ili robu
3. Sadrži govor mržnje, uvrede ili diskriminaciju
4. Pokušava prevare (phishing, scam)
5. Reklamira droge, oružje, lažne lekove
6. Sadrži lične podatke (JMBG, broj kartice)

Odgovori SAMO ovim JSON-om bez ikakvih dodatnih reči:
{"approved": true/false, "reason": "razlog na srpskom ako nije odobreno, prazno ako jeste", "confidence": 0-100}`
        }]
      })
    });

    if (!response.ok) return { approved: true, reason: '', confidence: 50 }; // Fallback — ne blokiraj ako API ne radi

    var data = await response.json();
    var text = data.content[0].text.trim();
    // Izvuci JSON iz odgovora
    var match = text.match(/\{[\s\S]*\}/);
    if (!match) return { approved: true, reason: '', confidence: 50 };
    return JSON.parse(match[0]);
  } catch(e) {
    console.warn('Moderacija teksta nije dostupna:', e.message);
    return { approved: true, reason: '', confidence: 50 }; // Fallback
  }
}

// ===== CLOUDINARY AI MODERACIJA SLIKA =====
// Cloudinary automatski skenira slike ako je moderacija uključena na presettu
// Vraća moderation_status iz upload responsa
function checkImageModeration(uploadResponse) {
  if (!uploadResponse) return { safe: true };
  var mod = uploadResponse.moderation;
  if (!mod || !mod.length) return { safe: true };
  var result = mod[0];
  return {
    safe: result.status === 'approved',
    status: result.status,
    reason: result.status === 'rejected' ? 'Slika sadrži neprimereni sadržaj.' : ''
  };
}

// ===== GLAVNA MODERACIJA =====
async function moderateAd(adData, photoModerationResults) {
  // 1. Proveri slike
  var unsafeImages = (photoModerationResults || []).filter(function(r) { return !r.safe; });
  if (unsafeImages.length > 0) {
    return {
      status: 'rejected',
      reason: 'Jedna ili više fotografija sadrže neprimereni sadržaj koji nije dozvoljen na ovom sajtu.'
    };
  }

  // 2. Proveri tekst (samo ako je API key postavljen)
  if (ANTHROPIC_KEY) {
    var textResult = await moderateText(adData.title, adData.description, adData.category);
    if (!textResult.approved && textResult.confidence > 70) {
      return {
        status: 'rejected',
        reason: textResult.reason || 'Oglas krši pravila korišćenja sajta.'
      };
    }
  }

  // 3. Odobreno — ide na admin pregled
  return { status: 'pending', reason: '' };
}

window.moderateAd = moderateAd;
window.checkImageModeration = checkImageModeration;

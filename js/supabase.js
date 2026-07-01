// ===== SUPABASE CONFIG =====
var SB_URL = 'https://iyuyhbgampbwkxlbdgvi.supabase.co';
var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI'
  + 'sInJlZiI6Iml5dXloYmdhbXBid2t4bGJkZ3ZpIiwicm9sZSI6ImFub24iLCJ'
  + 'pYXQiOjE3ODIwMDMwOTAsImV4cCI6MjA5NzU3OTA5MH0.28-mt9G-lMDr35ijigo2f5IiYrzcBZAF0Rf4Y9L4DUA';

function sbFetch(path, options) {
  var opts = options || {};
  var headers = {
    'apikey': SB_KEY,
    'Authorization': 'Bearer ' + SB_KEY,
    'Content-Type': 'application/json'
  };
  if (opts.prefer) headers['Prefer'] = opts.prefer;
  if (opts.headers) Object.assign(headers, opts.headers);

  return fetch(SB_URL + '/rest/v1/' + path, {
    method: opts.method || 'GET',
    headers: headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    mode: 'cors',
    credentials: 'omit'
  }).then(function(r) {
    if (r.status === 204) return null;
    if (r.status === 404) return [];
    return r.json().then(function(data) {
      if (!r.ok) {
        var msg = (data && (data.message || data.hint || data.error_description)) || ('HTTP ' + r.status);
        throw new Error(msg);
      }
      return data;
    });
  }).catch(function(e) {
    if (e.name === 'TypeError') throw new Error('Nije moguće povezati se sa serverom.');
    throw e;
  });
}


function sbRpc(funcName, params) {
  return fetch(SB_URL + '/rest/v1/rpc/' + funcName, {
    method: 'POST',
    headers: {
      'apikey': SB_KEY,
      'Authorization': 'Bearer ' + SB_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params || {}),
    mode: 'cors',
    credentials: 'omit'
  }).then(function(r) {
    if (r.status === 200 || r.status === 204) return null;
    return r.json().then(function(d) {
      throw new Error((d && d.message) || 'RPC greška ' + r.status);
    });
  });
}

// ===== SESSION =====
var SESSION = {
  get:   function() { try { return JSON.parse(localStorage.getItem('pk_session') || 'null'); } catch(e){ return null; } },
  set:   function(u) { localStorage.setItem('pk_session', JSON.stringify(u)); },
  clear: function() { localStorage.removeItem('pk_session'); }
};

// ===== USERS =====
var SB = {

  register: function(name, email, pass, city, phone) {
    email = email.trim().toLowerCase();
    return sbFetch('users?email=eq.' + encodeURIComponent(email)).then(function(existing) {
      if (existing && existing.length > 0) throw new Error('Korisnik sa ovom email adresom već postoji.');
      return sbFetch('users', {
        method: 'POST',
        prefer: 'return=representation',
        body: { name: name, email: email, pass: pass, city: city || '', phone: phone || '' }
      });
    }).then(function(rows) {
      var user = rows[0];
      var session = { id: user.id, name: user.name, email: user.email, city: user.city, phone: user.phone };
      SESSION.set(session);
      return session;
    });
  },

  login: function(email, pass) {
    email = email.trim().toLowerCase();
    return sbFetch('users?email=eq.' + encodeURIComponent(email) + '&pass=eq.' + encodeURIComponent(pass)).then(function(rows) {
      if (!rows || rows.length === 0) throw new Error('Pogrešan email ili lozinka.');
      var user = rows[0];
      var session = { id: user.id, name: user.name, email: user.email, city: user.city, phone: user.phone };
      SESSION.set(session);
      return session;
    });
  },

  logout: function() { SESSION.clear(); },

  getUserByEmail: function(email) {
    return sbFetch('users?email=eq.' + encodeURIComponent(email.trim().toLowerCase()));
  },

  getUserById: function(id) {
    return sbFetch('users?id=eq.' + encodeURIComponent(id)).then(function(rows){ return rows ? rows[0] : null; });
  },

  updateUser: function(id, data) {
    return sbFetch('users?id=eq.' + id, {
      method: 'PATCH',
      prefer: 'return=representation',
      body: data
    }).then(function(rows) {
      var cur = SESSION.get();
      if (cur && cur.id === id) SESSION.set(Object.assign({}, cur, data));
      return rows;
    });
  },

  resetPassword: function(email, newPass) {
    email = email.trim().toLowerCase();
    return sbFetch('users?email=eq.' + encodeURIComponent(email)).then(function(rows) {
      if (!rows || rows.length === 0) throw new Error('Ne postoji nalog sa ovom email adresom.');
      return sbFetch('users?email=eq.' + encodeURIComponent(email), {
        method: 'PATCH',
        prefer: 'return=representation',
        body: { pass: newPass }
      });
    });
  },

  // ===== ADS — javni (samo approved) =====
  getAds: function(filters) {
    filters = filters || {};
    var sort = filters.sort || 'newest';
    var orderClause = {
      'newest':     'created_at.desc',
      'oldest':     'created_at.asc',
      'price_asc':  'price.asc',
      'price_desc': 'price.desc'
    }[sort] || 'created_at.desc';

    var q = 'ads?status=eq.approved&expired_at=gt.' + new Date().toISOString() + '&order=' + orderClause;
    if (filters.category)  q += '&category=eq.'   + encodeURIComponent(filters.category);
    if (filters.city)      q += '&city=eq.'        + encodeURIComponent(filters.city);
    if (filters.condition) q += '&condition=eq.'   + encodeURIComponent(filters.condition);
    if (filters.userEmail) q += '&user_email=eq.'  + encodeURIComponent(filters.userEmail);
    if (filters.search) {
      // Pretraga po naslovu I opisu I gradu
      var s = encodeURIComponent('%' + filters.search + '%');
      q += '&or=(title.ilike.' + s + ',description.ilike.' + s + ',city.ilike.' + s + ')';
    }
    if (filters.minPrice != null && filters.minPrice !== '') q += '&price=gte.' + filters.minPrice;
    if (filters.maxPrice != null && filters.maxPrice !== '') q += '&price=lte.' + filters.maxPrice;
    var page    = filters.page    || 1;
    var perPage = filters.perPage || 16;
    q += '&limit=' + perPage + '&offset=' + ((page - 1) * perPage);

    // Dohvati i ukupan broj za paginaciju
    var countQ = q.replace('&limit=' + perPage + '&offset=' + ((page-1)*perPage), '') + '&limit=1';
    return Promise.all([
      sbFetch(q),
      fetch(
        'https://iyuyhbgampbwkxlbdgvi.supabase.co/rest/v1/' + countQ.replace('&order='+orderClause,'') + '&select=count',
        { headers: {
          'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY,
          'Prefer': 'count=exact', 'Range-Unit': 'items', 'Range': '0-0'
        }}
      ).then(function(r){ return parseInt(r.headers.get('content-range').split('/')[1]) || 0; }).catch(function(){ return null; })
    ]).then(function(results) {
      var ads = results[0] || [];
      ads._total = results[1];
      return ads;
    });
  },

  // Vlasnik vidi SVE svoje oglase (i pending i rejected)
  getMyAds: function(userEmail) {
    return sbFetch('ads?user_email=eq.' + encodeURIComponent(userEmail) + '&order=created_at.desc&limit=200')
      .then(function(r){ return r || []; });
  },

  getAdById: function(id) {
    return sbFetch('ads?id=eq.' + id).then(function(rows) { return rows ? rows[0] : null; });
  },

  insertAd: function(ad) {
    // Postavi trajanje oglasa na 30 dana
    ad.expired_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    return sbFetch('ads', {
      method: 'POST',
      prefer: 'return=representation',
      body: ad
    }).then(function(rows) { return rows[0]; });
  },

  updateAd: function(id, data) {
    return sbFetch('ads?id=eq.' + id, {
      method: 'PATCH',
      prefer: 'return=minimal',
      body: data
    });
  },

  deleteAd: function(id) {
    return sbFetch('ads?id=eq.' + id, { method: 'DELETE' });
  },

  // ===== ADMIN =====
  isAdmin: function(email) {
    return sbFetch('admins?email=eq.' + encodeURIComponent(email))
      .then(function(rows) { return rows && rows.length > 0; })
      .catch(function() { return false; });
  },

  getAllAdsAdmin: function(status) {
    var q = 'ads?order=created_at.desc&limit=200';
    if (status) q += '&status=eq.' + status;
    return sbFetch(q).then(function(r){ return r || []; }).catch(function(){ return []; });
  },

  approveAd: function(id) {
    // Koristimo RPC funkciju umesto PATCH da zaobiđemo CORS
    return sbRpc('approve_ad', { ad_id: id });
  },

  rejectAd: function(id, reason) {
    return sbRpc('reject_ad', { ad_id: id, reason: reason });
  },

  // ===== REVIEWS =====
  getReviews: function(toEmail) {
    return sbFetch('reviews?to_email=eq.' + encodeURIComponent(toEmail) + '&order=created_at.desc')
      .then(function(r){ return r || []; });
  },

  hasReviewed: function(fromEmail, adId) {
    return sbFetch('reviews?from_email=eq.' + encodeURIComponent(fromEmail) + '&ad_id=eq.' + encodeURIComponent(adId))
      .then(function(rows) { return rows && rows.length > 0; });
  },

  insertReview: function(review) {
    return sbFetch('reviews', {
      method: 'POST',
      prefer: 'return=representation',
      body: review
    });
  },

  // ===== FAVORITES =====
  getFavorites: function(userEmail) {
    return sbFetch('favorites?user_email=eq.' + encodeURIComponent(userEmail))
      .then(function(rows) { return (rows || []).map(function(r){ return r.ad_id; }); });
  },

  addFavorite: function(userEmail, adId) {
    return sbFetch('favorites', { method: 'POST', body: { user_email: userEmail, ad_id: adId } });
  },

  removeFavorite: function(userEmail, adId) {
    return sbFetch('favorites?user_email=eq.' + encodeURIComponent(userEmail) + '&ad_id=eq.' + encodeURIComponent(adId), { method: 'DELETE' });
  }
};

// Izloži sbFetch globalno za poruke.html
window.sbFetch = sbFetch;

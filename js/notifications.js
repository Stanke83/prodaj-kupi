// ===== IN-APP NOTIFIKACIJE =====
var Notifs = {
  getAll: function(userEmail) {
    return sbFetch('notifications?user_email=eq.' + encodeURIComponent(userEmail) +
      '&order=created_at.desc&limit=50').then(function(r){ return r||[]; });
  },
  getUnreadCount: function(userEmail) {
    return sbFetch('notifications?user_email=eq.' + encodeURIComponent(userEmail) +
      '&read=eq.false&select=id').then(function(r){ return (r||[]).length; });
  },
  add: function(userEmail, type, title, body, link) {
    return sbFetch('notifications', {
      method: 'POST',
      body: { user_email: userEmail, type: type, title: title, body: body, link: link||'' }
    });
  },
  markRead: function(id) {
    return sbFetch('notifications?id=eq.' + id, { method: 'PATCH', body: { read: true } });
  },
  markAllRead: function(userEmail) {
    return sbFetch('notifications?user_email=eq.' + encodeURIComponent(userEmail), {
      method: 'PATCH', body: { read: true }
    });
  }
};

// ===== NOTIF BELL U HEADERU =====
function renderNotifBell(userEmail) {
  Notifs.getUnreadCount(userEmail).then(function(count) {
    var existing = document.getElementById('notifBell');
    if (existing) existing.remove();
    var bell = document.createElement('div');
    bell.id = 'notifBell';
    bell.style.cssText = 'position:relative;cursor:pointer;display:flex;align-items:center';
    bell.innerHTML = '<button onclick="toggleNotifPanel()" style="background:none;border:none;cursor:pointer;font-size:1.3rem;padding:6px;position:relative" title="Notifikacije">🔔' +
      (count > 0 ? '<span style="position:absolute;top:2px;right:2px;background:#ef4444;color:#fff;font-size:.6rem;font-weight:700;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center">' + (count > 9 ? '9+' : count) + '</span>' : '') +
    '</button>';
    var actions = document.getElementById('headerActions');
    if (actions) actions.insertBefore(bell, actions.firstChild);
  });
}

function toggleNotifPanel() {
  var existing = document.getElementById('notifPanel');
  if (existing) { existing.remove(); return; }

  var user = SESSION.get();
  if (!user) return;

  var panel = document.createElement('div');
  panel.id = 'notifPanel';
  panel.style.cssText = 'position:fixed;top:60px;right:16px;width:340px;max-height:480px;background:#fff;border:1px solid var(--gray-200);border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.15);z-index:999;overflow:hidden;display:flex;flex-direction:column';

  panel.innerHTML = '<div style="padding:14px 18px;border-bottom:1px solid var(--gray-100);display:flex;align-items:center;justify-content:space-between">' +
    '<strong style="font-size:.95rem">Notifikacije</strong>' +
    '<button onclick="Notifs.markAllRead(\''+user.email+'\').then(function(){toggleNotifPanel();toggleNotifPanel();})" style="font-size:.78rem;color:var(--green);background:none;border:none;cursor:pointer;font-family:var(--font)">Označi sve kao pročitano</button>' +
  '</div>' +
  '<div id="notifList" style="overflow-y:auto;flex:1"><div style="padding:20px;text-align:center;color:var(--gray-400)">⏳ Učitavanje...</div></div>';

  document.body.appendChild(panel);

  // Zatvori na klik van panela
  setTimeout(function() {
    document.addEventListener('click', function handler(e) {
      if (!panel.contains(e.target) && e.target.id !== 'notifBell') {
        panel.remove();
        document.removeEventListener('click', handler);
      }
    });
  }, 100);

  Notifs.getAll(user.email).then(function(notifs) {
    var list = document.getElementById('notifList');
    if (!notifs.length) {
      list.innerHTML = '<div style="padding:32px;text-align:center;color:var(--gray-400)">🔔 Nema notifikacija</div>';
      return;
    }
    list.innerHTML = notifs.map(function(n) {
      var icon = {ad_approved:'✅',ad_rejected:'❌',new_message:'💬',ad_expiring:'⚠️'}[n.type] || '🔔';
      var bg = n.read ? '#fff' : '#f0fdf4';
      return '<div style="padding:14px 18px;border-bottom:1px solid var(--gray-100);background:'+bg+';cursor:pointer" onclick="notifClick(\''+n.id+'\',\''+n.link+'\')">' +
        '<div style="display:flex;gap:10px;align-items:flex-start">' +
          '<span style="font-size:1.2rem;flex-shrink:0">' + icon + '</span>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:.88rem;font-weight:600;margin-bottom:2px">' + escHtml(n.title) + '</div>' +
            '<div style="font-size:.8rem;color:var(--gray-500);line-height:1.4">' + escHtml(n.body) + '</div>' +
            '<div style="font-size:.74rem;color:var(--gray-400);margin-top:4px">' + timeAgo(n.created_at) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
    // Označi sve kao pročitano
    Notifs.markAllRead(user.email);
  });
}

function notifClick(id, link) {
  Notifs.markRead(id);
  document.getElementById('notifPanel')?.remove();
  if (link) window.location.href = link;
}

// ===== WEB PUSH =====
var VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBQYyCgrNmr5KDYR3r0';

async function requestPushPermission(userEmail) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  try {
    var perm = await Notification.requestPermission();
    if (perm !== 'granted') return false;
    var reg = await navigator.serviceWorker.register('/sw.js');
    var sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    await sbFetch('push_subscriptions', {
      method: 'POST',
      prefer: 'return=representation',
      body: { user_email: userEmail, subscription: sub.toJSON() }
    });
    return true;
  } catch(e) { console.warn('Push nije dostupan:', e); return false; }
}

function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding).replace(/-/g,'+'). replace(/_/g,'/');
  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);
  for (var i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

window.Notifs = Notifs;
window.renderNotifBell = renderNotifBell;
window.toggleNotifPanel = toggleNotifPanel;
window.notifClick = notifClick;
window.requestPushPermission = requestPushPermission;

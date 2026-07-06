/* =============================================
   AttendTrack — Shared App Logic
   ============================================= */

// ---- Session Guard ----
function getSession() {
  const s = sessionStorage.getItem('at_session');
  return s ? JSON.parse(s) : null;
  console.log(s)
}

(function guardSession() {
  const session = getSession();
  if (!session) { window.location.href = 'index.html'; }
})();

// ---- Populate nav user info ----
document.addEventListener('DOMContentLoaded', () => {
  const session = getSession();
  if (!session) return;

  const nameEl  = document.getElementById('nav-name');
  const orgEl   = document.getElementById('nav-org');
  const avEl    = document.getElementById('nav-avatar');
  if (nameEl) nameEl.textContent = session.name;
  if (orgEl)  orgEl.textContent  = session.org || 'My Organisation';
  if (avEl)   avEl.textContent   = session.name.charAt(0).toUpperCase();

  // Mark active nav
  const cur = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item').forEach(a => {
    const href = a.getAttribute('href').split('?')[0];
    a.classList.toggle('active', href === cur);
  });

  // Mobile sidebar toggle
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  const menuBtn  = document.getElementById('menu-toggle');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('visible');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('at_session');
      window.location.href = 'index.html';
    });
  }
});

// ---- Data helpers ----
function getOwnerKey(suffix) {
  const s = getSession();
  return s ? `at_${s.id}_${suffix}` : null;
}

function loadData(key) {
  const k = getOwnerKey(key);
  return k ? JSON.parse(localStorage.getItem(k) || '[]') : [];
}
function saveData(key, arr) {
  const k = getOwnerKey(key);
  if (k) localStorage.setItem(k, JSON.stringify(arr));
}
function loadMap(key) {
  const k = getOwnerKey(key);
  return k ? JSON.parse(localStorage.getItem(k) || '{}') : {};
}
function saveMap(key, obj) {
  const k = getOwnerKey(key);
  if (k) localStorage.setItem(k, JSON.stringify(obj));
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

// ---- Toast ----
let toastTimer;
function showToast(msg, type = 'success') {
  let t = document.getElementById('app-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'app-toast';
    t.className = 'toast';
    t.innerHTML = '<div class="toast-dot"></div><span></span>';
    document.body.appendChild(t);
  }
  t.querySelector('span').textContent = msg;
  t.querySelector('.toast-dot').className = 'toast-dot' + (type === 'error' ? ' error' : '');
  clearTimeout(toastTimer);
  t.classList.add('show');
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

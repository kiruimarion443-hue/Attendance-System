/* =============================================
   AttendTrack — Auth Logic
   ============================================= */

// ---------- Tab switching ----------
const tabs      = document.querySelectorAll('.tab-btn');
const loginPanel  = document.getElementById('login-panel');
const signupPanel = document.getElementById('signup-panel');

function showTab(name) {
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  loginPanel.classList.toggle('hidden',  name !== 'login');
  signupPanel.classList.toggle('hidden', name !== 'signup');
}

tabs.forEach(t => t.addEventListener('click', () => showTab(t.dataset.tab)));
document.querySelectorAll('[data-switch]').forEach(a =>
  a.addEventListener('click', e => { e.preventDefault(); showTab(a.dataset.switch); })
);

// ---------- Password visibility ----------
document.querySelectorAll('.toggle-pwd').forEach(btn => {
  btn.addEventListener('click', () => {
    const inp = document.getElementById(btn.dataset.target);
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
});

// ---------- Password strength ----------
const pwdInput  = document.getElementById('signup-password');
const fill      = document.getElementById('strength-fill');
const label     = document.getElementById('strength-label');
const colors    = ['#f43f5e','#fb923c','#facc15','#10b981'];
const labels    = ['Too short','Weak','Moderate','Strong'];

pwdInput.addEventListener('input', () => {
  const v = pwdInput.value;
  let score = 0;
  if (v.length >= 8)  score++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
  if (/\d/.test(v))   score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  const pct = v.length === 0 ? 0 : Math.max(1, score) * 25;
  fill.style.width      = pct + '%';
  fill.style.background = v.length === 0 ? '' : colors[score - 1] || colors[0];
  label.textContent     = v.length === 0 ? '' : labels[score - 1] || labels[0];
  label.style.color     = v.length === 0 ? '' : colors[score - 1] || colors[0];
});

// ---------- Helpers ----------
const DB_KEY = 'attendtrack_users';

function getUsers() {
  return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
}
function saveUsers(arr) {
  localStorage.setItem(DB_KEY, JSON.stringify(arr));
}
function setSession(user) {
  sessionStorage.setItem('at_session', JSON.stringify({ id: user.id, name: user.fname + ' ' + user.lname, email: user.email, org: user.org }));
}
function showError(id, msg)   { const el = document.getElementById(id); el.textContent = msg; el.classList.remove('hidden'); }
function clearMsg(id)         { document.getElementById(id).classList.add('hidden'); }

// ---------- Sign Up ----------
document.getElementById('signup-btn').addEventListener('click', () => {
  clearMsg('signup-error'); clearMsg('signup-success');

  const fname = document.getElementById('signup-fname').value.trim();
  const lname = document.getElementById('signup-lname').value.trim();
  const org   = document.getElementById('signup-org').value.trim();
  const email = document.getElementById('signup-email').value.trim().toLowerCase();
  const pwd   = document.getElementById('signup-password').value;

  if (!fname || !lname) return showError('signup-error', 'Please enter your first and last name.');
  if (!org)             return showError('signup-error', 'Please enter your organisation or school name.');
  if (!email || !email.includes('@')) return showError('signup-error', 'Please enter a valid email address.');
  if (pwd.length < 8)  return showError('signup-error', 'Password must be at least 8 characters.');

  const users = getUsers();
  if (users.find(u => u.email === email)) return showError('signup-error', 'An account with this email already exists.');

  const user = { id: Date.now().toString(), fname, lname, org, email, pwd, createdAt: new Date().toISOString() };
  users.push(user);
  saveUsers(users);

  document.getElementById('signup-success').textContent = 'Account created! Signing you in…';
  document.getElementById('signup-success').classList.remove('hidden');

  setTimeout(() => {
    setSession(user);
    window.location.href = 'dashboard.html';
  }, 900);
});

// ---------- Sign In ----------
document.getElementById('login-btn').addEventListener('click', () => {
  clearMsg('login-error');

  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pwd   = document.getElementById('login-password').value;

  if (!email || !pwd) return showError('login-error', 'Please fill in all fields.');

  const users = getUsers();
  const user = users.find(u => u.email === email && u.pwd === pwd);
  if (!user) return showError('login-error', 'Incorrect email or password.');

  setSession(user);
  window.location.href = 'dashboard.html';
});

// Enter key support
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (!loginPanel.classList.contains('hidden'))  document.getElementById('login-btn').click();
  if (!signupPanel.classList.contains('hidden')) document.getElementById('signup-btn').click();
});

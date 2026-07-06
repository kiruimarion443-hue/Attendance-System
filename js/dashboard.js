/* Dashboard page logic */
document.addEventListener('DOMContentLoaded', () => {
  const session = getSession();

  // Greeting
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('greeting').textContent = `${greet}, ${session.name.split(' ')[0]}`;
  document.getElementById('today-date').textContent = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Stats
  const classes  = loadData('classes');
  const students = loadData('students');
  const sessions = loadData('sessions');

  document.getElementById('stat-classes').textContent  = classes.length;
  document.getElementById('stat-students').textContent = students.length;
  document.getElementById('stat-sessions').textContent = sessions.length;

  // Average attendance rate
  if (sessions.length) {
    let totalPct = 0;
    sessions.forEach(s => {
      const total = (s.records || []).length;
      const present = (s.records || []).filter(r => r.status === 'present').length;
      totalPct += total ? (present / total) * 100 : 0;
    });
    document.getElementById('stat-rate').textContent = Math.round(totalPct / sessions.length) + '%';
  }

  // Recent sessions
  const container = document.getElementById('recent-sessions');
  const recent = [...sessions].reverse().slice(0, 6);
  if (recent.length) {
    container.innerHTML = recent.map(s => {
      const cls = classes.find(c => c.id === s.classId);
      const total   = (s.records || []).length;
      const present = (s.records || []).filter(r => r.status === 'present').length;
      const pct = total ? Math.round((present / total) * 100) : 0;
      return `<div class="session-item">
        <div class="session-dot"></div>
        <div class="session-info">
          <div class="session-name">${cls ? cls.name : 'Unknown Class'}</div>
          <div class="session-meta">${new Date(s.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</div>
        </div>
        <span class="session-badge">${pct}%</span>
      </div>`;
    }).join('');
  }
});

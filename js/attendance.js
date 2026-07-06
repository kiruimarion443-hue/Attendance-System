/* Take Attendance page */
let attRecords = {}; // studentId -> 'present' | 'absent' | 'late'

function updateCounts() {
  const vals = Object.values(attRecords);
  document.getElementById('att-present-count').textContent = vals.filter(v => v === 'present').length + ' Present';
  document.getElementById('att-absent-count').textContent  = vals.filter(v => v === 'absent').length + ' Absent';
  document.getElementById('att-late-count').textContent    = vals.filter(v => v === 'late').length + ' Late';
}

function setStatus(studentId, status) {
  attRecords[studentId] = status;
  const row = document.querySelector(`[data-student="${studentId}"]`);
  if (!row) return;
  row.classList.remove('present', 'absent', 'late');
  if (status) row.classList.add(status);
  row.querySelectorAll('.att-btn').forEach(btn => btn.classList.remove('active-p','active-a','active-l'));
  const map = { present: 'active-p', absent: 'active-a', late: 'active-l' };
  if (status) row.querySelector(`[data-action="${status}"]`).classList.add(map[status]);
  updateCounts();
}

document.addEventListener('DOMContentLoaded', () => {
  // Populate classes
  const classes = loadData('classes');
  const sel = document.getElementById('att-class');
  if (!classes.length) {
    sel.innerHTML = '<option value="">No classes — create one first</option>';
  } else {
    sel.innerHTML = '<option value="">— Choose a class —</option>' +
      classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  }

  // Default date = today
  document.getElementById('att-date').value = new Date().toISOString().split('T')[0];

  document.getElementById('start-btn').addEventListener('click', () => {
    const classId = sel.value;
    const date    = document.getElementById('att-date').value;
    if (!classId) return showToast('Please select a class', 'error');
    if (!date)    return showToast('Please select a date', 'error');

    const students = loadData('students').filter(s => s.classId === classId);
    if (!students.length) return showToast('No students enrolled in this class', 'error');

    const cls = classes.find(c => c.id === classId);
    document.getElementById('att-session-title').textContent =
      `${cls.name} — ${new Date(date + 'T12:00:00').toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}`;

    attRecords = {};
    students.forEach(s => { attRecords[s.id] = 'present'; }); // default present

    const grid = document.getElementById('att-grid');
    grid.innerHTML = students.map((s, i) => `
      <div class="att-row present" data-student="${s.id}">
        <div class="avatar" style="width:32px;height:32px;font-size:.75rem;flex-shrink:0">${s.fname.charAt(0)}${s.lname.charAt(0)}</div>
        <span class="att-student-name">${s.fname} ${s.lname}${s.stuId ? ` <span style="color:var(--text-3);font-weight:400">#${s.stuId}</span>` : ''}</span>
        <div class="att-buttons">
          <button class="att-btn active-p" data-action="present" onclick="setStatus('${s.id}','present')">Present</button>
          <button class="att-btn" data-action="late" onclick="setStatus('${s.id}','late')">Late</button>
          <button class="att-btn" data-action="absent" onclick="setStatus('${s.id}','absent')">Absent</button>
        </div>
      </div>
    `).join('');

    updateCounts();
    document.getElementById('marking-section').style.display = 'block';
    document.getElementById('marking-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('mark-all-present').addEventListener('click', () => {
    Object.keys(attRecords).forEach(id => setStatus(id, 'present'));
  });
  document.getElementById('mark-all-absent').addEventListener('click', () => {
    Object.keys(attRecords).forEach(id => setStatus(id, 'absent'));
  });

  document.getElementById('cancel-btn').addEventListener('click', () => {
    document.getElementById('marking-section').style.display = 'none';
    attRecords = {};
  });

  document.getElementById('save-att-btn').addEventListener('click', () => {
    const classId = document.getElementById('att-class').value;
    const date    = document.getElementById('att-date').value;
    const notes   = document.getElementById('att-notes').value.trim();

    const records = Object.entries(attRecords).map(([studentId, status]) => ({ studentId, status }));
    const session = { id: uid(), classId, date, notes, records, createdAt: new Date().toISOString() };

    const sessions = loadData('sessions');
    sessions.push(session);
    saveData('sessions', sessions);

    document.getElementById('marking-section').style.display = 'none';
    attRecords = {};
    document.getElementById('att-class').value = '';
    document.getElementById('att-notes').value = '';

    showToast('Attendance saved successfully');
    setTimeout(() => window.location.href = 'reports.html', 1200);
  });
});

/* Reports page */

function switchTab(name) {
  document.getElementById('tab-sessions').classList.toggle('active', name === 'sessions');
  document.getElementById('tab-students').classList.toggle('active', name === 'students');
  document.getElementById('sessions-view').style.display = name === 'sessions' ? '' : 'none';
  document.getElementById('students-view').style.display = name === 'students' ? '' : 'none';
  if (name === 'students') renderStudentSummary();
}

function populateFilters() {
  const classes = loadData('classes');
  const opts = classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  ['sess-class-filter','stu-class-filter'].forEach(id => {
    document.getElementById(id).innerHTML = '<option value="">All Classes</option>' + opts;
  });
}

function renderSessions() {
  const sessions = loadData('sessions');
  const classes  = loadData('classes');
  const cf = document.getElementById('sess-class-filter').value;
  const df = document.getElementById('sess-date-from').value;
  const dt = document.getElementById('sess-date-to').value;

  const filtered = sessions.filter(s => {
    if (cf && s.classId !== cf) return false;
    if (df && s.date < df) return false;
    if (dt && s.date > dt) return false;
    return true;
  }).reverse();

  const tbody = document.getElementById('sessions-tbody');
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No sessions found</div></td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map(s => {
    const cls = classes.find(c => c.id === s.classId);
    const total   = (s.records || []).length;
    const present = (s.records || []).filter(r => r.status === 'present').length;
    const absent  = (s.records || []).filter(r => r.status === 'absent').length;
    const late    = (s.records || []).filter(r => r.status === 'late').length;
    const rate    = total ? Math.round((present / total) * 100) : 0;
    const rateCls = rate >= 80 ? 'badge-green' : rate >= 60 ? 'badge-amber' : 'badge-red';
    return `<tr>
      <td>${new Date(s.date + 'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</td>
      <td class="td-main">${cls ? cls.name : '—'}</td>
      <td><span class="badge badge-green">${present}</span></td>
      <td><span class="badge badge-red">${absent}</span></td>
      <td><span class="badge badge-amber">${late}</span></td>
      <td><span class="badge ${rateCls}">${rate}%</span></td>
      <td>
        <button class="btn-ghost" style="font-size:.78rem;padding:.3rem .7rem" onclick="viewDetail('${s.id}')">View</button>
        <button class="btn-ghost" style="font-size:.78rem;padding:.3rem .7rem;margin-left:4px;color:var(--rose)" onclick="deleteSession('${s.id}')">Delete</button>
      </td>
    </tr>`;
  }).join('');
}

function renderStudentSummary() {
  const sessions = loadData('sessions');
  const students = loadData('students');
  const classes  = loadData('classes');
  const cf = document.getElementById('stu-class-filter').value;
  const sf = document.getElementById('stu-search').value.toLowerCase();

  const filtered = students.filter(s => {
    if (cf && s.classId !== cf) return false;
    if (sf && !(s.fname + ' ' + s.lname).toLowerCase().includes(sf)) return false;
    return true;
  });

  const tbody = document.getElementById('stu-summary-tbody');
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No students found</div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const cls = classes.find(c => c.id === s.classId);
    // Gather all records for this student
    let totalSessions = 0, present = 0, absent = 0, late = 0;
    sessions.filter(sess => sess.classId === s.classId).forEach(sess => {
      const rec = (sess.records || []).find(r => r.studentId === s.id);
      if (rec) {
        totalSessions++;
        if (rec.status === 'present') present++;
        else if (rec.status === 'absent') absent++;
        else if (rec.status === 'late') late++;
      }
    });
    const rate = totalSessions ? Math.round((present / totalSessions) * 100) : null;
    const rateCls = rate === null ? 'badge-indigo' : rate >= 80 ? 'badge-green' : rate >= 60 ? 'badge-amber' : 'badge-red';
    return `<tr>
      <td class="td-main">${s.fname} ${s.lname}</td>
      <td>${cls ? cls.name : '—'}</td>
      <td>${totalSessions}</td>
      <td><span class="badge badge-green">${present}</span></td>
      <td><span class="badge badge-red">${absent}</span></td>
      <td><span class="badge badge-amber">${late}</span></td>
      <td><span class="badge ${rateCls}">${rate !== null ? rate + '%' : 'N/A'}</span></td>
    </tr>`;
  }).join('');
}

function viewDetail(sessionId) {
  const sessions = loadData('sessions');
  const students = loadData('students');
  const classes  = loadData('classes');
  const s = sessions.find(x => x.id === sessionId);
  if (!s) return;
  const cls = classes.find(c => c.id === s.classId);
  document.getElementById('detail-title').textContent =
    `${cls ? cls.name : 'Session'} — ${new Date(s.date + 'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}`;

  const rows = (s.records || []).map(r => {
    const stu = students.find(x => x.id === r.studentId);
    const name = stu ? `${stu.fname} ${stu.lname}` : 'Unknown';
    const cls2 = { present: 'badge-green', absent: 'badge-red', late: 'badge-amber' }[r.status] || 'badge-indigo';
    return `<tr><td class="td-main">${name}</td><td><span class="badge ${cls2}">${r.status}</span></td></tr>`;
  }).join('') || `<tr><td colspan="2"><div class="empty-state">No records</div></td></tr>`;

  document.getElementById('detail-body').innerHTML = `
    ${s.notes ? `<p style="color:var(--text-2);margin-bottom:1rem;font-size:.875rem">Notes: ${s.notes}</p>` : ''}
    <div class="tbl-wrap"><table><thead><tr><th>Student</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  document.getElementById('detail-modal').classList.remove('hidden');
}

function deleteSession(id) {
  if (!confirm('Delete this session permanently?')) return;
  saveData('sessions', loadData('sessions').filter(s => s.id !== id));
  renderSessions();
  showToast('Session deleted');
}

document.addEventListener('DOMContentLoaded', () => {
  populateFilters();
  renderSessions();

  ['sess-class-filter','sess-date-from','sess-date-to'].forEach(id =>
    document.getElementById(id).addEventListener('change', renderSessions));
  document.getElementById('stu-search').addEventListener('input', renderStudentSummary);
  document.getElementById('stu-class-filter').addEventListener('change', renderStudentSummary);
});

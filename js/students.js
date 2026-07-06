/* Students page */
let editingId = null;

function populateClassDropdowns() {
  const classes = loadData('classes');
  const opts = classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  document.getElementById('stu-class').innerHTML = '<option value="">— Select a class —</option>' + opts;
  document.getElementById('class-filter').innerHTML = '<option value="">All Classes</option>' + opts;
}                  

function renderStudents(filter = '', classFilter = '') {
  const students = loadData('students');
  const classes  = loadData('classes');
  const tbody = document.getElementById('students-tbody');
  const lc = filter.toLowerCase();
  const filtered = students.filter(s => {
    const name = (s.fname + ' ' + s.lname).toLowerCase();
    const matchText  = !lc || name.includes(lc) || (s.stuId || '').toLowerCase().includes(lc);
    const matchClass = !classFilter || s.classId === classFilter;
    return matchText && matchClass;
  });

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">${filter || classFilter ? 'No students match your filter' : 'No students yet — add your first student'}</div></td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map(s => {
    const cls = classes.find(c => c.id === s.classId);
    return `<tr>
      <td class="td-main">${s.fname} ${s.lname}</td>
      <td>${s.stuId || '—'}</td>
      <td>${cls ? `<span class="badge badge-indigo">${cls.name}</span>` : '—'}</td>
      <td>${new Date(s.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</td>
      <td>
        <button class="btn-ghost" style="font-size:.78rem;padding:.3rem .7rem" onclick="openEdit('${s.id}')">Edit</button>
        <button class="btn-ghost" style="font-size:.78rem;padding:.3rem .7rem;margin-left:4px;color:var(--rose)" onclick="deleteStudent('${s.id}')">Delete</button>
      </td>
    </tr>`;
  }).join('');
}

function openModal(title = 'Add Student') {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('student-modal').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('student-modal').classList.add('hidden');
  ['stu-fname','stu-lname','stu-id','stu-email'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('stu-class').value = '';
  editingId = null;
}
function openEdit(id) {
  const s = loadData('students').find(x => x.id === id);
  if (!s) return;
  editingId = id;
  document.getElementById('stu-fname').value = s.fname;
  document.getElementById('stu-lname').value = s.lname;
  document.getElementById('stu-id').value    = s.stuId || '';
  document.getElementById('stu-email').value = s.email || '';
  document.getElementById('stu-class').value = s.classId || '';
  openModal('Edit Student');
}
function deleteStudent(id) {
  if (!confirm('Delete this student?')) return;
  saveData('students', loadData('students').filter(s => s.id !== id));
  renderStudents(document.getElementById('search-input').value, document.getElementById('class-filter').value);
  showToast('Student deleted');
}

document.addEventListener('DOMContentLoaded', () => {
  populateClassDropdowns();
  renderStudents();

  if (new URLSearchParams(location.search).get('action') === 'new') openModal();

  document.getElementById('add-student-btn').addEventListener('click', () => openModal());
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
  document.getElementById('student-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });

  document.getElementById('modal-save-btn').addEventListener('click', () => {
    const fname   = document.getElementById('stu-fname').value.trim();
    const lname   = document.getElementById('stu-lname').value.trim();
    const classId = document.getElementById('stu-class').value;
    if (!fname || !lname) return showToast('First and last name required', 'error');
    if (!classId) return showToast('Please select a class', 'error');

    const students = loadData('students');
    const data = {
      fname, lname, classId,
      stuId: document.getElementById('stu-id').value.trim(),
      email: document.getElementById('stu-email').value.trim()
    };
    if (editingId) {
      const idx = students.findIndex(s => s.id === editingId);
      if (idx >= 0) students[idx] = { ...students[idx], ...data };
    } else {
      students.push({ id: uid(), ...data, createdAt: new Date().toISOString() });
    }
    saveData('students', students);
    closeModal();
    renderStudents(document.getElementById('search-input').value, document.getElementById('class-filter').value);
    showToast(editingId ? 'Student updated' : 'Student added');
  });

  document.getElementById('search-input').addEventListener('input', () =>
    renderStudents(document.getElementById('search-input').value, document.getElementById('class-filter').value));
  document.getElementById('class-filter').addEventListener('change', () =>
    renderStudents(document.getElementById('search-input').value, document.getElementById('class-filter').value));
});

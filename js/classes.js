/* Classes page */
let editingId = null;

function renderClasses(filter = '') {
  const classes  = loadData('classes');
  const students = loadData('students');
  const tbody = document.getElementById('classes-tbody');
  const lc = filter.toLowerCase();
  const filtered = classes.filter(c =>
    c.name.toLowerCase().includes(lc) || (c.subject || '').toLowerCase().includes(lc)
  );
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">${filter ? 'No classes match your search' : 'No classes yet — create your first class'}</div></td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map(c => {
    const count = students.filter(s => s.classId === c.id).length;
    return `<tr>
      <td class="td-main">${c.name}</td>
      <td>${c.subject || '—'}</td>
      <td><span class="badge badge-indigo">${count} student${count !== 1 ? 's' : ''}</span></td>
      <td>${new Date(c.createdAt).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}</td>
      <td>
        <button class="btn-ghost" style="font-size:.78rem;padding:.3rem .7rem" onclick="openEdit('${c.id}')">Edit</button>
        <button class="btn-ghost" style="font-size:.78rem;padding:.3rem .7rem;margin-left:4px;color:var(--rose)" onclick="deleteClass('${c.id}')">Delete</button>
      </td>
    </tr>`;
  }).join('');
}

function openModal(title = 'New Class') {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('class-modal').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('class-modal').classList.add('hidden');
  document.getElementById('cls-name').value = '';
  document.getElementById('cls-subject').value = '';
  document.getElementById('cls-desc').value = '';
  editingId = null;
}

function openEdit(id) {
  const cls = loadData('classes').find(c => c.id === id);
  if (!cls) return;
  editingId = id;
  document.getElementById('cls-name').value    = cls.name;
  document.getElementById('cls-subject').value = cls.subject || '';
  document.getElementById('cls-desc').value    = cls.desc || '';
  openModal('Edit Class');
}

function deleteClass(id) {
  if (!confirm('Delete this class? Attendance records will remain.')) return;
  const classes = loadData('classes').filter(c => c.id !== id);
  saveData('classes', classes);
  renderClasses(document.getElementById('search-input').value);
  showToast('Class deleted');
}

document.addEventListener('DOMContentLoaded', () => {
  renderClasses();

  // Open modal if ?action=new
  if (new URLSearchParams(location.search).get('action') === 'new') openModal();

  document.getElementById('add-class-btn').addEventListener('click', () => openModal());
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
  document.getElementById('class-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });

  document.getElementById('modal-save-btn').addEventListener('click', () => {
    const name = document.getElementById('cls-name').value.trim();
    if (!name) { showToast('Class name is required', 'error'); return; }
    const classes = loadData('classes');
    if (editingId) {
      const idx = classes.findIndex(c => c.id === editingId);
      if (idx >= 0) {
        classes[idx].name    = name;
        classes[idx].subject = document.getElementById('cls-subject').value.trim();
        classes[idx].desc    = document.getElementById('cls-desc').value.trim();
      }
    } else {
      classes.push({ id: uid(), name, subject: document.getElementById('cls-subject').value.trim(), desc: document.getElementById('cls-desc').value.trim(), createdAt: new Date().toISOString() });
    }
    saveData('classes', classes);
    closeModal();
    renderClasses();
    showToast(editingId ? 'Class updated' : 'Class created');
  });

  document.getElementById('search-input').addEventListener('input', e => renderClasses(e.target.value));
});

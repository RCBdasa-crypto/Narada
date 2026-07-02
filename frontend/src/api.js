const API_BASE = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  if (response.status === 204) return null;
  return response.json();
}

function buildQuery(params) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export async function fetchTodos({ status, folderId } = {}) {
  const response = await fetch(
    `${API_BASE}/todos${buildQuery({ status, folder_id: folderId })}`
  );
  return handleResponse(response);
}

export async function fetchFolders() {
  return handleResponse(await fetch(`${API_BASE}/folders`));
}

export async function createFolder(name) {
  return handleResponse(
    await fetch(`${API_BASE}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
  );
}

export async function updateFolder(id, data) {
  return handleResponse(
    await fetch(`${API_BASE}/folders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  );
}

export async function deleteFolder(id) {
  return handleResponse(await fetch(`${API_BASE}/folders/${id}`, { method: 'DELETE' }));
}

export async function createTodo(data) {
  return handleResponse(
    await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  );
}

export async function updateTodo(id, data) {
  return handleResponse(
    await fetch(`${API_BASE}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  );
}

export async function setTodoStatus(id, status) {
  return handleResponse(
    await fetch(`${API_BASE}/todos/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  );
}

export async function deleteTodoPermanently(id) {
  return handleResponse(
    await fetch(`${API_BASE}/todos/${id}/permanent`, { method: 'DELETE' })
  );
}

export async function uploadAttachment(todoId, file, kind = 'file') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('originalName', file.name);
  formData.append('kind', kind);
  return handleResponse(
    await fetch(`${API_BASE}/todos/${todoId}/attachments`, { method: 'POST', body: formData })
  );
}

export async function deleteAttachment(todoId, attachmentId) {
  return handleResponse(
    await fetch(`${API_BASE}/todos/${todoId}/attachments/${attachmentId}`, { method: 'DELETE' })
  );
}

export async function createSubtask(todoId, title, titleStyle = {}) {
  return handleResponse(
    await fetch(`${API_BASE}/todos/${todoId}/subtasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, title_style: titleStyle }),
    })
  );
}

export async function toggleSubtask(todoId, subtaskId) {
  return handleResponse(
    await fetch(`${API_BASE}/todos/${todoId}/subtasks/${subtaskId}/toggle`, { method: 'PATCH' })
  );
}

export async function deleteSubtask(todoId, subtaskId) {
  return handleResponse(
    await fetch(`${API_BASE}/todos/${todoId}/subtasks/${subtaskId}`, { method: 'DELETE' })
  );
}

export async function fetchSettings() {
  return handleResponse(await fetch(`${API_BASE}/settings`));
}

export async function updateSettings(data) {
  return handleResponse(
    await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  );
}

export async function uploadRingtone(file) {
  const formData = new FormData();
  formData.append('file', file);
  return handleResponse(
    await fetch(`${API_BASE}/settings/ringtone`, { method: 'POST', body: formData })
  );
}

export async function dispatchReminder(todoId) {
  return handleResponse(await fetch(`${API_BASE}/reminders/${todoId}/dispatch`, { method: 'POST' }));
}

export function getUploadUrl(filename) {
  return `/uploads/${filename}`;
}

export function getAttachmentUrl(todoId, attachmentId) {
  return `${API_BASE}/todos/${todoId}/attachments/${attachmentId}`;
}

const API_BASE = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function fetchTodos() {
  const response = await fetch(`${API_BASE}/todos`);
  return handleResponse(response);
}

export async function createTodo(data) {
  const response = await fetch(`${API_BASE}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateTodo(id, data) {
  const response = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteTodo(id) {
  const response = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

export async function uploadAttachment(todoId, file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/todos/${todoId}/attachments`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
}

export async function deleteAttachment(todoId, attachmentId) {
  const response = await fetch(`${API_BASE}/todos/${todoId}/attachments/${attachmentId}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

export function getUploadUrl(filename) {
  return `/uploads/${filename}`;
}

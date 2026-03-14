import api from './axios';

export const exportCSV = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/export/csv`, {
    responseType: 'blob',
  });

  // Extract filename from Content-Disposition header
  const disposition = response.headers['content-disposition'];
  let fileName = `expenses_${groupId}.csv`;
  if (disposition) {
    const match = disposition.match(/filename="?([^";\n]+)"?/);
    if (match && match[1]) {
      fileName = match[1];
    }
  }

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const normalizeRole = (role?: string | null): 'admin' | 'manager' | 'member' => {
  const value = (role || '').toLowerCase().trim();

  if (value === 'admin') return 'admin';
  if (value === 'manager' || value === 'project_manager' || value === 'project-manager') {
    return 'manager';
  }
  return 'member';
};

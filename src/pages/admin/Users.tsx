import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import type { Role } from '../../context/AuthContext';

interface UserRow {
  id: string;
  email: string;
  full_name?: string;
  role: Role;
}

export const Users: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const { data, error: err } = await supabase
          .from('profiles')
          .select('id, email, full_name, role')
          .order('email', { ascending: true });
        if (err) {
          setError(err.message);
          return;
        }
        const mapped: UserRow[] =
          data?.map((row: any) => ({
            id: row.id,
            email: row.email,
            full_name: row.full_name ?? undefined,
            role: (row.role as Role) ?? 'user',
          })) ?? [];
        setUsers(mapped);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateRole = async (id: string, role: Role) => {
    try {
      setSavingId(id);
      setError(null);
      const { error: err } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);
      if (err) {
        setError(err.message);
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role } : u))
      );
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-500">
          {t('users.loading', 'Loading users...')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('users.title', 'Users and roles')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t(
              'users.subtitle',
              'Manage access levels for your team members'
            )}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('users.columns.email', 'Email')}
              </th>
              <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('users.columns.name', 'Name')}
              </th>
              <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('users.columns.role', 'Role')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.full_name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <select
                    value={user.role}
                    disabled={savingId === user.id}
                    onChange={(e) => updateRole(user.id, e.target.value as Role)}
                    className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm rtl:text-right"
                  >
                    <option value="owner">
                      {t('users.roles.owner', 'Owner')}
                    </option>
                    <option value="admin">
                      {t('users.roles.admin', 'Admin')}
                    </option>
                    <option value="manager">
                      {t('users.roles.manager', 'Manager')}
                    </option>
                    <option value="user">
                      {t('users.roles.user', 'User')}
                    </option>
                  </select>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-6 text-center text-sm text-gray-500"
                >
                  {t('users.empty', 'No users found')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


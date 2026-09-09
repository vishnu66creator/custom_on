import { useState, useEffect, useCallback } from "react";
import { userService } from "../services/userService";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const list = await userService.getUsers();
      setUsers(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = async (id, role) => {
    const res = await userService.updateUserRole(id, role);
    await fetchUsers();
    return res;
  };

  const toggleUserStatus = async (id) => {
    const res = await userService.toggleUserStatus(id);
    await fetchUsers();
    return res;
  };

  return {
    users,
    loading,
    refresh: fetchUsers,
    updateUserRole,
    toggleUserStatus,
  };
}

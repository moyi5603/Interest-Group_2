import { useCallback, useState } from "react";
import { getAppRole, setAppRole, type AppRole } from "@/lib/appRoleStore";

export const useAppRole = () => {
  const [role, setRoleState] = useState<AppRole>(() => getAppRole());

  const setRole = useCallback((next: AppRole) => {
    setAppRole(next);
    setRoleState(next);
  }, []);

  return {
    role,
    setRole,
    isManager: role === "manager",
    isEmployee: role === "employee",
  };
};

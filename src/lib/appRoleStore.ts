export type AppRole = "employee" | "manager";

const STORAGE_KEY = "exp-app-role";

export const getAppRole = (): AppRole => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === "manager" ? "manager" : "employee";
  } catch {
    return "employee";
  }
};

export const setAppRole = (role: AppRole) => {
  localStorage.setItem(STORAGE_KEY, role);
};

/** 管理员身份：可创建小组、发布活动等组织操作 */
export const canManageInterestGroups = () => getAppRole() === "manager";

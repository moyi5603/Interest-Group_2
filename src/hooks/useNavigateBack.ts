import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const inferFallback = (pathname: string): string => {
  if (pathname.startsWith("/agents/interest-groups")) {
    return "/agents/interest-groups";
  }
  if (pathname.startsWith("/agents")) return "/agents";
  if (pathname.startsWith("/colleagues")) return "/colleagues";
  if (pathname.startsWith("/profile")) return "/";
  return "/";
};

/** 优先浏览器历史后退；无历史时回到模块首页，避免 Tab 页被重置到默认态 */
export function useNavigateBack(explicitFallback?: string) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const fallback = explicitFallback ?? inferFallback(pathname);

  return useCallback(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    if (typeof idx === "number" && idx > 0) {
      navigate(-1);
      return;
    }
    navigate(fallback);
  }, [navigate, fallback]);
}

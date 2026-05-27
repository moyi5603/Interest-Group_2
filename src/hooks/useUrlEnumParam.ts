import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/** 将 Tab 等枚举状态写入 URL，后退时可恢复（切换 Tab 使用 replace，不额外压栈） */
export function useUrlEnumParam<T extends string>(
  paramKey: string,
  defaultValue: T,
  allowedValues: readonly T[],
): [T, (next: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = useMemo(() => {
    const raw = searchParams.get(paramKey);
    if (raw && (allowedValues as readonly string[]).includes(raw)) {
      return raw as T;
    }
    return defaultValue;
  }, [searchParams, paramKey, defaultValue, allowedValues]);

  const setValue = useCallback(
    (next: T) => {
      setSearchParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev);
          if (next === defaultValue) {
            nextParams.delete(paramKey);
          } else {
            nextParams.set(paramKey, next);
          }
          return nextParams;
        },
        { replace: true },
      );
    },
    [paramKey, defaultValue, setSearchParams],
  );

  return [value, setValue];
}

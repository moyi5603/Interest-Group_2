import type { CSSProperties } from "react";
import { toast as sonnerToast, Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/** 移动端居中纯文本 Toast */
const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="dark"
    position="top-center"
    duration={2000}
    closeButton={false}
    richColors={false}
    expand
    visibleToasts={1}
    className="app-toast-host"
    style={
      {
        "--width": "auto",
      } as CSSProperties
    }
    icons={{
      success: null,
      error: null,
      info: null,
      warning: null,
      loading: null,
    }}
    toastOptions={{
      unstyled: true,
      icon: null,
      classNames: {
        toast: "app-toast-item",
        title: "app-toast-title",
        description: "hidden",
        icon: "hidden",
        content: "app-toast-content",
      },
    }}
    {...props}
  />
);

type ToastMessage = string | number;

/** 纯文本提示，不区分 success/error 样式 */
const showToast = (message: ToastMessage) =>
  sonnerToast(String(message), { icon: null });

export const toast = Object.assign(showToast, {
  success: showToast,
  error: showToast,
  info: showToast,
  message: showToast,
  warning: showToast,
  loading: showToast,
  dismiss: sonnerToast.dismiss,
  promise: sonnerToast.promise,
  custom: sonnerToast.custom,
});

export const appToast = {
  show: showToast,
  success: showToast,
  error: showToast,
  info: showToast,
};

export { Toaster };

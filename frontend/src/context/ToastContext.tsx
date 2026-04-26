import { Alert, Snackbar } from "@mui/material";
import { createContext, useCallback, useContext, useState } from "react";

type ToastSeverity = "error" | "warning" | "info" | "success";

type ToastState = {
  open: boolean;
  message: string;
  severity: ToastSeverity;
};

type ToastContextValue = {
  showToast: (message: string, severity?: ToastSeverity) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "error",
  });

  const showToast = useCallback((message: string, severity: ToastSeverity = "error") => {
    setToast({ open: true, message, severity });
  }, []);

  function handleClose(_: React.SyntheticEvent | Event, reason?: string) {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return ctx;
}

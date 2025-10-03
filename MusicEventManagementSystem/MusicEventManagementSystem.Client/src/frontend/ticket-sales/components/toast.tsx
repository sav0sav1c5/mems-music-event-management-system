import { toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showToast = {
  success: (message: string) => {
    toast.success(
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5" />
        <span>{message}</span>
      </div>,
      defaultOptions
    );
  },
  error: (message: string) => {
    toast.error(
      <div className="flex items-center gap-2">
        <XCircle className="w-5 h-5" />
        <span>{message}</span>
      </div>,
      defaultOptions
    );
  },
  warning: (message: string) => {
    toast.warning(
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>{message}</span>
      </div>,
      defaultOptions
    );
  },
  info: (message: string) => {
    toast.info(
      <div className="flex items-center gap-2">
        <Info className="w-5 h-5" />
        <span>{message}</span>
      </div>,
      defaultOptions
    );
  },
};
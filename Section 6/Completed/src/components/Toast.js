import { useState, useEffect } from "react";

import { Toast } from "react-bootstrap";

import "./toast.scss";

let id = 0;

const ToastManager = {
  toasts: [],
  listeners: [],

  addListener(listener) {
    this.listeners.push(listener);
  },

  removeListener(listener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  },

  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.toasts));
  },

  addToast(message) {
    const newToast = { id: id++, message };
    this.toasts = [...this.toasts, newToast];
    this.notifyListeners();
    setTimeout(() => this.removeToast(newToast.id), 3000);
  },

  removeToast(toastId) {
    this.toasts = this.toasts.filter((toast) => toast.id !== toastId);
    this.notifyListeners();
  },
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  // The toast container listens for updates from the shared toast manager.
  useEffect(() => {
    ToastManager.addListener(setToasts);
    return () => {
      ToastManager.removeListener(setToasts);
    };
  }, []);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id}>
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      ))}
    </div>
  );
};

export { ToastContainer, ToastManager };

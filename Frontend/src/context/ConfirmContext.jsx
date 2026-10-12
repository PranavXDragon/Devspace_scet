"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import ConfirmModal from "@/components/common/ConfirmModal";

const ConfirmContext = createContext();

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context.confirm;
};

export const useAlert = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useAlert must be used within a ConfirmProvider");
  }
  return context.showAlert;
};

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    type: "danger",
    resolve: null,
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      let opts = {};
      if (typeof options === "string") {
        opts = { message: options };
      } else if (typeof options === "object" && options !== null) {
        opts = options;
      }

      setConfirmState({
        isOpen: true,
        title: opts.title || "Confirm Action",
        message: opts.message || "Are you sure you want to proceed?",
        confirmText: opts.confirmText || "Confirm",
        cancelText: opts.cancelText || "Cancel",
        type: opts.type || "danger",
        resolve,
      });
    });
  }, []);

  const showAlert = useCallback((options) => {
    return new Promise((resolve) => {
      let opts = {};
      if (typeof options === "string") {
        opts = { message: options };
      } else if (typeof options === "object" && options !== null) {
        opts = options;
      }

      setConfirmState({
        isOpen: true,
        title: opts.title || "Notice",
        message: opts.message || "",
        confirmText: opts.confirmText || "Okay",
        cancelText: null,
        type: opts.type || "warning",
        resolve,
      });
    });
  }, []);

  confirm.alert = showAlert;

  const handleConfirm = () => {
    if (confirmState.resolve) {
      confirmState.resolve(true);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (confirmState.resolve) {
      confirmState.resolve(false);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmContext.Provider value={{ confirm, showAlert }}>
      {children}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
};

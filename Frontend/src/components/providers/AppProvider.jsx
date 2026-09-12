"use client";

import { Provider } from "react-redux";
import store from "@/store/store";
import { ConfirmProvider } from "@/context/ConfirmContext";
import GlobalMessage from "@/components/common/GlobalMessage";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { injectGetToken } from "@/services/axiosInstance";

function ClerkTokenInjector() {
  const { getToken } = useAuth();
  // Inject synchronously during render so it's ready before child component effects run
  injectGetToken(getToken);
  return null;
}

export default function AppProvider({ children }) {
  return (
    <Provider store={store}>
      <ClerkTokenInjector />
      <ConfirmProvider>
        <GlobalMessage />
        {children}
      </ConfirmProvider>
    </Provider>
  );
}

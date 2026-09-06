"use client";

import { Provider } from "react-redux";
import store from "@/store/store";
import { ConfirmProvider } from "@/context/ConfirmContext";
import GlobalMessage from "@/components/common/GlobalMessage";

export default function AppProvider({ children }) {
  return (
    <Provider store={store}>
      <ConfirmProvider>
        <GlobalMessage />
        {children}
      </ConfirmProvider>
    </Provider>
  );
}

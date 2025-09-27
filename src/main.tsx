import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./App.css";
import { Provider } from "react-redux";
import { store } from "@/store/config.ts";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { electron } from "@/store/electron/actions.ts";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n.ts";

const Router = electron ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <App Router={Router} />
      </Provider>
    </I18nextProvider>
  </React.StrictMode>,
);

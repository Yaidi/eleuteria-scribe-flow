import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "@/store/config.ts";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { electron } from "@/store/electron/actions.ts";

const Router = electron ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App Router={Router} />
    </Provider>
  </React.StrictMode>,
);

import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { rootReducer, RootState, store } from "@/store/config.ts";
import React from "react";
import { configureStore } from "@reduxjs/toolkit";

export function renderWithProviders(ui: React.ReactNode, stateOverride?: Partial<RootState>) {
  const store = createMockStore(stateOverride);

  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store,
  };
}

export function createMockStore(state?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: {
      ...store.getState(),
      ...state,
    },
  });
}

export const renderWithStore = (ui: React.ReactElement) =>
  render(<Provider store={store}>{ui}</Provider>);

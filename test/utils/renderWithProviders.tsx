import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "@/store/config.ts";
import React from "react";

export function renderWithProviders(ui: React.ReactNode) {
  return render(<Provider store={store}>{ui}</Provider>);
}

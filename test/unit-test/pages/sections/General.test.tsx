import { describe, expect, test, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import General from "@/pages/sections/General.tsx";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
import { renderWithProviders } from "../../../utils/renderWithProviders.tsx";
import * as storeActions from "@/store/sections";

const updateGeneralSpy = vi.spyOn(storeActions, "updateGeneral");

describe("General Component", () => {
  test("should render inputs with initial state", () => {
    renderWithProviders(<General />);

    const title = screen.getByLabelText("Title");
    fireEvent.change(title, { target: { value: "Updated Title" } });
    expect(screen.getByLabelText("Title")).toHaveValue("Updated Title");
    expect(screen.getByLabelText("Subtitle")).toHaveValue("");
    expect(screen.getByLabelText(/Author/i)).toHaveValue("");
    expect(screen.getByLabelText(/Series/i)).toHaveValue("");
    expect(screen.getByLabelText("Volume")).toHaveValue(0);
    expect(screen.getByLabelText(/Genre/i)).toHaveValue("");
    expect(screen.getByLabelText(/License/i)).toHaveValue("");
  });

  test("should dispatch updateGeneral on input change", () => {
    renderWithProviders(<General />);

    const titleInput = screen.getByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "Updated Title" } });

    expect(updateGeneralSpy).toHaveBeenCalledWith({ title: "Updated Title" });
  });

  test("should dispatch updateGeneral on select change", async () => {
    renderWithProviders(<General />);
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });

    // Select genre
    const genreTrigger = screen.getByRole("combobox", { name: "Genre" });
    await user.click(genreTrigger);
    const genreOption = screen.getByText("Fantasy");
    await user.click(genreOption);

    expect(updateGeneralSpy).toHaveBeenCalledWith({ genre: "fantasy" });

    // Select license
    const licenseTrigger = screen.getByText(/Select license/i);
    await user.click(licenseTrigger);
    const licenseOption = screen.getByText("Public Domain");
    await user.click(licenseOption);

    expect(updateGeneralSpy).toHaveBeenCalledWith({ license: "public-domain" });
  });
});

import { describe, expect, test } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import General from "@/pages/sections/General.tsx";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
import { renderWithProviders } from "../../../utils/renderWithProviders.tsx";
import * as storeActions from "@/store/sections";
import { mockThunkSuccess } from "../../../utils/mockThunkSuccess.ts";
import { IGeneral } from "@/types/sections.ts";
import { mockGeneral } from "../../../mocks";
import { updateGeneral } from "@/store/sections";

mockThunkSuccess<IGeneral>(storeActions, "updateGeneral", mockGeneral);

describe("General Component", () => {
  test("should render inputs with initial state", () => {
    renderWithProviders(<General />);

    expect(screen.getByLabelText("Title")).toHaveValue("");
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

    expect(updateGeneral).toHaveBeenCalledWith({
      projectId: expect.any(Number),
      general: { title: "Updated Title" },
    });
  });

  test("should dispatch updateGeneral on select change", async () => {
    renderWithProviders(<General />);
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });

    // Select genre
    const genreTrigger = screen.getByRole("combobox", { name: "Genre" });
    await user.click(genreTrigger);
    const genreOption = screen.getByText("Fantasy");
    await user.click(genreOption);

    expect(updateGeneral).toHaveBeenCalledWith({
      projectId: expect.any(Number),
      general: { genre: "fantasy" },
    });

    // Select license
    const licenseTrigger = screen.getByText(/Select license/i);
    await user.click(licenseTrigger);
    const licenseOption = screen.getByText("Public Domain");
    await user.click(licenseOption);

    expect(updateGeneral).toHaveBeenCalledWith({
      projectId: expect.any(Number),
      general: { license: "public-domain" },
    });
  });
});

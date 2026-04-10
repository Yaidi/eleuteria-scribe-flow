import { describe, expect, test } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
import { renderWithProviders } from "../../../utils/renderWithProviders.tsx";
import * as storeActions from "@/store/sections";
import { mockThunkSuccess } from "../../../utils/mockThunkSuccess.ts";
import { IGeneral } from "@/types/sections.ts";
import { mockGeneral } from "../../../mocks";
import { updateGeneral } from "@/store/sections";
import FormGeneralBook from "@/components/forms/FormGeneralBook.tsx";

mockThunkSuccess<IGeneral>(storeActions, "updateGeneral", mockGeneral);

describe("Form General Book", () => {
  test("should render inputs with initial state", () => {
    renderWithProviders(<FormGeneralBook general={mockGeneral} projectId={1} />);

    expect(screen.getByLabelText("Title")).toHaveValue("The Dark Streets");
    expect(screen.getByLabelText("Subtitle")).toHaveValue("A Detective's Journey");
    expect(screen.getByLabelText(/Author/i)).toHaveValue("A. Writer");
    expect(screen.getByLabelText(/Serie/i)).toHaveValue("The Metropolis Chronicles");
    expect(screen.getByLabelText("Volume")).toHaveValue(1);
    expect(screen.getByLabelText(/Genre/i)).toHaveValue("");
    expect(screen.getByLabelText(/License/i)).toHaveValue("");
  });

  test("should dispatch updateGeneral on input change", () => {
    renderWithProviders(<FormGeneralBook general={mockGeneral} projectId={1} />);

    const titleInput = screen.getByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "Updated Title" } });

    expect(updateGeneral).toHaveBeenCalledWith({
      projectId: expect.any(Number),
      general: { title: "Updated Title" },
    });
  });

  test("should dispatch updateGeneral on select change", async () => {
    renderWithProviders(<FormGeneralBook general={mockGeneral} projectId={1} />);
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });

    const genreTrigger = screen.getByRole("combobox", { name: "Genre" });
    await user.click(genreTrigger);
    const genreOption = await screen.findByRole("option", {
      name: "Fantasy",
    });
    await user.click(genreOption);

    expect(updateGeneral).toHaveBeenCalledWith({
      projectId: expect.any(Number),
      general: { genre: "fantasy" },
    });

    // Select license
    const licenseTrigger = screen.getByRole("combobox", { name: "License" });
    await user.click(licenseTrigger);
    const licenseOption = await screen.findByRole("option", { name: "Public domain" });
    await user.click(licenseOption);

    expect(updateGeneral).toHaveBeenCalledWith({
      projectId: expect.any(Number),
      general: { license: "public-domain" },
    });
  });
});

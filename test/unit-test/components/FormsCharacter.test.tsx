import { describe, test, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormsCharacters from "@/components/FormsCharacters";
import { mockCharacters } from "../../mocks";
import { renderWithStore } from "../../utils/renderWithProviders.tsx";
import { deleteCharacterFetch, updateCharacter } from "@/store";
import { mockThunkSuccess } from "../../utils/mockThunkSuccess.ts";
import * as asyncActions from "@/store/sections/characters/slice.ts";
import { ICharacter } from "@/types/sections.ts";

const mockDispatch = vi.fn();
vi.mock("react-redux", async () => {
  const actual = await vi.importActual<typeof import("react-redux")>("react-redux");
  return {
    ...actual,
    useDispatch: vi.fn(() => mockDispatch),
  };
});

mockThunkSuccess<number>(asyncActions, "deleteCharacterFetch", 1);
mockThunkSuccess<ICharacter>(asyncActions, "updateCharacter", mockCharacters[1]);

describe("FormsCharacters", () => {
  test("renders FormsCharacters", () => {
    renderWithStore(<FormsCharacters character={mockCharacters[0]} />);
    expect(screen.getByTestId("form-character")).toBeInTheDocument();
    expect(screen.getByTestId("input-character-name")).toHaveValue("John Doe");
    expect(screen.getByText("Main character")).toBeInTheDocument();
    expect(screen.getByTestId("textarea-characteristics")).toBeInTheDocument(); // characteristics
  });

  test("actualiza el nombre del personaje", async () => {
    renderWithStore(<FormsCharacters character={mockCharacters[0]} />);
    const input = screen.getByTestId("input-character-name");
    await userEvent.clear(input);
    await userEvent.type(input, "Jane Smith");

    expect(mockDispatch).toHaveBeenCalled();
    expect(updateCharacter).toHaveBeenCalledWith({
      id: 1,
      info: { name: "" },
    });
    expect(updateCharacter).toHaveBeenCalledWith({
      id: 1,
      info: { name: "" },
    });
  });

  test("update the importance of the character", async () => {
    renderWithStore(<FormsCharacters character={mockCharacters[0]} />);
    const importanceTrigger = screen.getByRole("combobox", {
      name: "",
    });
    await userEvent.click(importanceTrigger); // abre select
    await userEvent.click(screen.getByText("Secondary character")); // selecciona

    expect(mockDispatch).toHaveBeenCalled();
    expect(updateCharacter).toHaveBeenCalledWith({
      id: 1,
      info: { importance: 1 },
    });
  });

  test("actualiza las características", async () => {
    renderWithStore(<FormsCharacters character={mockCharacters[0]} />);
    const textarea = screen.getByTestId("textarea-characteristics");
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "Smart and witty");

    expect(mockDispatch).toHaveBeenCalled();
    expect(updateCharacter).toHaveBeenCalledWith({
      id: 1,
      info: {
        name: "",
      },
    });
  });

  test("elimina al personaje al hacer click en el botón", async () => {
    renderWithStore(<FormsCharacters character={mockCharacters[0]} />);
    const deleteButton = screen.getByTestId("btn-remove-character");
    await userEvent.click(deleteButton);

    expect(mockDispatch).toHaveBeenCalled();
    expect(deleteCharacterFetch).toHaveBeenCalledWith(1);
  });
});

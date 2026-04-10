import { describe, beforeEach, vi, test, expect } from "vitest";
import { screen } from "@testing-library/react";
import Characters from "@/pages/sections/Characters.tsx";
import { renderWithProviders } from "../../../utils/renderWithProviders.tsx";
import { mockThunkSuccess } from "../../../utils/mockThunkSuccess.ts";
import * as asyncActions from "@/store/sections/characters/slice.ts";
import { ESections, ICharacter } from "@/types/sections.ts";
import { mockCharacters, mockProjectData } from "../../../mocks";
import { store } from "@/store/config.ts";

vi.mock("@/components/FormsCharacters", () => ({
  __esModule: true,
  default: () => <div data-testid="form-character">Mocked Form</div>,
}));

const dispatchMock = vi.fn();

vi.mock("react-redux", async () => {
  const actual = await vi.importActual<typeof import("react-redux")>("react-redux");
  return {
    ...actual,
    useDispatch: vi.fn(() => dispatchMock),
  };
});

mockThunkSuccess<ICharacter>(asyncActions, "addCharacterFetch", mockCharacters[0]);

describe("<Characters />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("no renders when projectId is undefined", () => {
    renderWithProviders(<Characters />);
    expect(screen.queryByText("Characters")).toBeNull();
  });

  test("renders title and empty message when no characters", () => {
    renderWithProviders(<Characters />, {
      project: {
        ...store.getState().project,
        currentProject: mockProjectData,
        currentSection: ESections.characters,
      },
    });

    expect(screen.getByText(/No characters added yet/i)).toBeTruthy();
  });

  test("renders FormsCharacters when currentCharacter exists", async () => {
    renderWithProviders(<Characters />, {
      project: {
        ...store.getState().project,
        currentProject: mockProjectData,
        currentSection: ESections.characters,
        sections: {
          ...store.getState().project.sections,
          characters: {
            characters: mockCharacters,
            currentCharacter: mockCharacters[0],
          },
        },
      },
    });

    expect(screen.getByTestId("form-character")).toBeTruthy();
  });
});

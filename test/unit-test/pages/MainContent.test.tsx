import { mockThunkSuccess } from "../../utils/mockThunkSuccess.ts";

const mockDispatch = vi.fn();
const navigateMock = vi.fn();

vi.mock("@/store/electron/actions.ts", () => ({
  getCurrentId: vi.fn(() => Promise.resolve(1)),
  setCurrentId: vi.fn(),
}));

vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/pages/sections/SwitchSections", () => ({
  renderCurrentSection: vi.fn(() => <div>Mocked Section</div>),
}));

mockThunkSuccess<ProjectData>(asyncActions, "getProjectFetch", mockProjectData);

// ⚠️ DESPUÉS van los imports que ejecutan código del app o pruebas
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, test, expect } from "vitest";
import { renderWithProviders } from "../../utils/renderWithProviders.tsx";
import MainContent from "@/pages/MainContent.tsx";
import { mockProjectData } from "../../mocks";
import { getProjectFetch } from "@/store/projects/slice";
import { ESections } from "@/types/sections.ts";
import * as asyncActions from "@/store/projects/slice";
import { ProjectData } from "@/types/project.ts";

// Test suite
describe("MainContent", () => {
  test("fetches project if currentProject is undefined", async () => {
    renderWithProviders(<MainContent />);
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
      expect(getProjectFetch).toHaveBeenCalledWith(1);
    });
  });

  test("navigates to / when back button is clicked", () => {
    renderWithProviders(<MainContent />, {
      project: {
        currentProject: mockProjectData,
        currentSection: ESections.characters,
      },
    });
    const backButton = screen.getByTestId("btn-back");
    fireEvent.click(backButton);
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  test("toggles dark mode", async () => {
    renderWithProviders(<MainContent />, {
      project: {
        currentProject: mockProjectData,
        currentSection: ESections.characters,
      },
    });
    const toggleButton = screen.getByTestId("btn-dark-mode");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  test("renders Main Content", () => {
    renderWithProviders(<MainContent />, {
      project: {
        currentProject: mockProjectData,
        currentSection: ESections.characters,
      },
    });
    expect(screen.getByText("The Dark Streets")).toBeInTheDocument();
    expect(screen.getByText("Mocked Section")).toBeInTheDocument();
  });
});

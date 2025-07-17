import { describe, expect, test, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../utils/renderWithProviders.tsx";
import Welcome from "@/pages/welcome/Welcome.tsx";
import { screen, fireEvent } from "@testing-library/react";
import * as fetchModule from "@/https/fetch";
import { templates } from "../../mocks/templates.ts";
import { act } from "react";
import { Templates } from "@/types/templates.ts";
import { mockProjectData } from "../../mocks";
import * as projectsSlice from "@/store/projects/slice.ts";
import { mockThunkSuccess } from "../../utils/mockThunkSuccess.ts";
import { ProjectData, ProjectType } from "@/types/project.ts";

// Mock fetch templates
vi.mock("@/https/fetch", () => ({
  getTemplates: vi.fn(() => Promise.resolve<Templates>({ templates: templates })),
}));

const dispatchMock = vi.fn(() => ({
  unwrap: () => Promise.resolve(),
}));
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("react-redux", async () => {
  const actual = await vi.importActual<typeof import("react-redux")>("react-redux");
  return {
    ...actual,
    useDispatch: vi.fn(() => dispatchMock),
  };
});

mockThunkSuccess<ProjectData>(projectsSlice, "getProjectFetch", mockProjectData);
mockThunkSuccess<ProjectData>(projectsSlice, "addProjectFetch", mockProjectData);
mockThunkSuccess<ProjectData[]>(projectsSlice, "projectsFetch", [mockProjectData]);

beforeEach(() => {
  vi.clearAllMocks(); // limpia navigate, dispatch, etc.
});

describe("Welcome Page", () => {
  test("should toggle dark mode", () => {
    renderWithProviders(<Welcome />);

    const button = screen.getByTestId("btn-dark-mode");
    expect(screen.getByTestId("welcome-container").className).not.toContain("dark");
    act(() => {
      fireEvent.click(button);
    });

    expect(screen.getByTestId("welcome-container").className).toContain("dark");
  });

  test("should call create project and navigate", async () => {
    renderWithProviders(<Welcome />);
    await act(async () => {
      await vi.waitFor(() => {
        expect(fetchModule.getTemplates).toHaveBeenCalled();
      });
    });

    expect(screen.findByTestId("template-name")).toBeTruthy();

    const button = screen.getByTestId("btn-create-project");
    await act(async () => {
      button.click();
      await vi.waitFor(() => {
        expect(projectsSlice.addProjectFetch).toHaveBeenCalledWith({
          projectListID: 1,
          type: ProjectType.NOVEL,
        });
      });
      expect(mockNavigate).toHaveBeenCalledWith("/main");
    });
  });

  test("should call add project and failed", async () => {
    dispatchMock.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue(new Error("API failed")),
    });
    renderWithProviders(<Welcome />);

    await act(async () => {
      await vi.waitFor(() => {
        expect(fetchModule.getTemplates).toHaveBeenCalled();
      });
    });
    expect(screen.findByTestId("template-name")).toBeTruthy();

    const button = screen.getByTestId("btn-create-project");
    await act(async () => {
      button.click();
      await vi.waitFor(() => {
        expect(projectsSlice.addProjectFetch).toHaveBeenCalledWith({
          projectListID: 1,
          type: ProjectType.NOVEL,
        });
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
  test("should change template", async () => {
    renderWithProviders(<Welcome />);

    await act(async () => {
      await vi.waitFor(() => {
        expect(fetchModule.getTemplates).toHaveBeenCalled();
      });
    });

    expect(screen.getByText("Novel Template")).toBeTruthy();

    screen.getByTestId("btn-thesis").click();

    await vi.waitFor(() => {
      expect(screen.getByText("Thesis Template")).toBeTruthy();
      expect(screen.queryByText("Novel Template")).toBeNull();
    });
  });
});

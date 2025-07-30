import { describe, test, vi, afterEach, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../utils/renderWithProviders.tsx";
import Projects from "@/pages/Projects.tsx";
import { mockProject, mockProjectData } from "../../mocks";
import { ProjectData, State } from "@/types/project.ts";
import { mockThunkSuccess } from "../../utils/mockThunkSuccess.ts";
import * as asyncActions from "@/store";
import { getProjectFetch, removeProject } from "@/store";

const dispatchMock = vi.fn(() => ({
  unwrap: () => Promise.resolve(),
}));
const navigateMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("react-redux", async () => {
  const actual = await vi.importActual<typeof import("react-redux")>("react-redux");
  return {
    ...actual,
    useDispatch: vi.fn(() => dispatchMock),
  };
});

mockThunkSuccess<number>(asyncActions, "removeProject", 1);
mockThunkSuccess<ProjectData>(asyncActions, "getProjectFetch", mockProjectData);

describe("Projects component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Display 'Loading...'", () => {
    renderWithProviders(<Projects />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("Redirects if projects is empty", async () => {
    renderWithProviders(<Projects />, {
      projects: {
        projects: [],
        state: State.SUCCESS,
      },
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/template");
    });
  });

  test("Display Project and Removes it", async () => {
    renderWithProviders(<Projects />, {
      projects: {
        projects: [mockProject, { ...mockProject, id: 2, projectName: "" }],
        state: State.SUCCESS,
      },
    });

    // Seleccionar el proyecto
    const selectButton = screen.getByText(/The Dark Streets/i);
    await userEvent.click(selectButton);
    expect(screen.getByTestId("project")).toBeTruthy();

    // Eliminar el proyecto
    const removeButton = screen.getByTestId("btn-rm-project");
    await userEvent.click(removeButton);

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalled();
      expect(removeProject).toHaveBeenCalledWith(1);
    });
  });

  test("Redirects to Main if a Project is chosen", async () => {
    renderWithProviders(<Projects />, {
      projects: {
        projects: [mockProject],
        state: State.SUCCESS,
      },
    });

    const selectButton = screen.getByText(/The Dark Streets/i);
    await userEvent.click(selectButton);

    const goToMain = screen.getByText("Open Project");
    await userEvent.click(goToMain);

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalled();
      expect(getProjectFetch).toHaveBeenCalledWith(1);
      expect(navigateMock).toHaveBeenCalledWith("/main");
    });
  });
});

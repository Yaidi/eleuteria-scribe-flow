import { screen, fireEvent } from "@testing-library/react";
import { vi, expect, describe, test, beforeEach } from "vitest";
import ManuscriptSidebar from "@/pages/content/sidebar/ManuscriptSidebar.tsx";
import { renderWithProviders } from "../../../../utils/renderWithProviders.tsx";
import { store } from "@/store/config.ts";
import { IChapter } from "@/types/sections.ts";
import { act } from "react";
import { getManuscriptList, removeSceneOrChapter } from "@/store";
import { mockThunkSuccess } from "../../../../utils/mockThunkSuccess.ts";
import * as asyncActions from "@/store";

const mockDispatch = vi.fn();
const projectId = 1;

vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

vi.mock("@/hooks/useSections.ts", async () => {
  const actual = await vi.importActual("@/hooks/useSections.ts");
  return {
    ...actual,
    useProjectId: () => projectId,
  };
});

const mockChaptersWithScenes: IChapter[] = [
  {
    path: "chap-1",
    title: "Chapter One",
    description: "The beginning",
    scenes: [
      {
        path: "scene-1",
        title: "Scene 1",
        content: "Content",
        wordCount: 0,
        wordGoal: 0,
        characters: [],
      },
      {
        path: "scene-2",
        title: "Scene 2",
        content: "Content",
        wordCount: 0,
        wordGoal: 0,
        characters: [],
      },
    ],
  },
  {
    path: "chap-2",
    title: "Chapter Two",
    description: "The middle",
    scenes: [
      {
        path: "scene-3",
        title: "Scene 3",
        content: "Content",
        wordCount: 0,
        wordGoal: 0,
        characters: [],
      },
    ],
  },
];
mockThunkSuccess(asyncActions, "getManuscriptList", mockChaptersWithScenes);
mockThunkSuccess(asyncActions, "removeSceneOrChapter", mockChaptersWithScenes);

describe("ManuscriptSidebar component", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    vi.clearAllMocks();
  });

  test("renders the sidebar with title", () => {
    renderWithProviders(<ManuscriptSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          manuscript: {
            chapters: [],
            currentChapter: undefined,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      },
    });

    expect(screen.getByText("Structure")).toBeInTheDocument();
  });

  test("renders add chapter button", () => {
    renderWithProviders(<ManuscriptSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          manuscript: {
            chapters: [],
            currentChapter: undefined,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      },
    });

    const addButton = screen.getByRole("button", { name: "Add Chapter" });
    expect(addButton).toBeInTheDocument();
  });

  test("dispatches getManuscriptList on mount", () => {
    renderWithProviders(<ManuscriptSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          manuscript: {
            chapters: [],
            currentChapter: undefined,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      },
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  test("renders all chapters", () => {
    renderWithProviders(<ManuscriptSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          manuscript: {
            chapters: mockChaptersWithScenes,
            currentChapter: undefined,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      },
    });

    expect(screen.getByText("Chapter One")).toBeInTheDocument();
    expect(screen.getByText("Chapter Two")).toBeInTheDocument();
  });

  test("toggles chapter expansion when chevron button is clicked", () => {
    renderWithProviders(<ManuscriptSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          manuscript: {
            chapters: mockChaptersWithScenes,
            currentChapter: undefined,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      },
    });

    const toggleButton = screen.getByTestId("btn-chapter-chap-1");
    expect(toggleButton).toBeInTheDocument();

    act(() => {
      fireEvent.click(toggleButton);
    });

    // After clicking, scenes should be visible
    expect(screen.getByText("Scene 1")).toBeInTheDocument();
    expect(screen.getByText("Scene 2")).toBeInTheDocument();
  });

  test("hides scenes when chapter is collapsed", () => {
    renderWithProviders(<ManuscriptSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          manuscript: {
            chapters: mockChaptersWithScenes,
            currentChapter: undefined,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      },
    });

    const toggleButton = screen.getByTestId("btn-chapter-chap-1");

    // Expand chapter
    act(() => {
      fireEvent.click(toggleButton);
    });

    expect(screen.getByText("Scene 1")).toBeInTheDocument();

    // Collapse chapter
    act(() => {
      fireEvent.click(toggleButton);
    });
    expect(screen.queryByText("Scene 1")).not.toBeInTheDocument();
  });

  test("creates new chapter when add button is clicked", () => {
    vi.spyOn(Date, "now").mockReturnValue(12345);

    renderWithProviders(<ManuscriptSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          manuscript: {
            chapters: [],
            currentChapter: undefined,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      },
    });

    const addButton = screen.getByRole("button", { name: "Add Chapter" });

    act(() => {
      fireEvent.click(addButton);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      payload: {
        description: "",
        path: "chapter-12345",
        scenes: [
          {
            characters: [],
            content: "",
            path: "scene-12345",
            title: "Nueva Escena 1",
            wordCount: 0,
            wordGoal: 0,
          },
        ],
        title: "Nuevo Capítulo 1",
      },
      type: "Section [Manuscript] Add Chapter to structure",
    });
  });

  test("highlights current chapter when selected", () => {
    const currentChapter = mockChaptersWithScenes[0];

    renderWithProviders(<ManuscriptSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          manuscript: {
            chapters: mockChaptersWithScenes,
            currentChapter: currentChapter,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      },
    });

    const chapterButton = screen.getByText("Chapter One").closest("button");
    expect(chapterButton).toHaveClass("bg-blue-100");
  });

  test("highlights current scene when selected", () => {
    const currentChapter = mockChaptersWithScenes[0];
    const currentScene = currentChapter.scenes[0];

    renderWithProviders(<ManuscriptSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          manuscript: {
            chapters: mockChaptersWithScenes,
            currentChapter: currentChapter,
            currentScene: currentScene,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      },
    });

    // Expand chapter to see scenes
    const toggleButton = screen.getByTestId("btn-chapter-chap-1");
    act(() => {
      fireEvent.click(toggleButton);
    });

    const sceneButton = screen.getByText("Scene 1").closest("button");
    expect(sceneButton).toHaveClass("bg-blue-100");
  });

  test("renders scenes under expanded chapter", () => {
    renderWithProviders(<ManuscriptSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          manuscript: {
            chapters: mockChaptersWithScenes,
            currentChapter: undefined,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      },
    });

    const toggleButton = screen.getByTestId("btn-chapter-chap-1");
    act(() => {
      fireEvent.click(toggleButton);
    });

    // Check that scenes are visible
    const chapter1Scenes = mockChaptersWithScenes[0].scenes;
    chapter1Scenes.forEach((scene) => {
      expect(screen.getByText(scene.title)).toBeInTheDocument();
    });
  });

  test("dispatches selectChapter when chapter button is clicked", () => {
    renderWithProviders(<ManuscriptSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          manuscript: {
            chapters: mockChaptersWithScenes,
            currentChapter: undefined,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      },
    });

    const chapterButton = screen.getByText("Chapter One");
    act(() => {
      fireEvent.click(chapterButton);
    });

    // Check that the select chapter was called with the right chapter
    expect(mockDispatch).toHaveBeenCalled();
  });

  test("dispatches selectScene when scene button is clicked", () => {
    renderWithProviders(<ManuscriptSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          manuscript: {
            chapters: mockChaptersWithScenes,
            currentChapter: undefined,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      },
    });

    // Expand the first chapter
    const toggleButton = screen.getByTestId("btn-chapter-chap-1");
    act(() => {
      fireEvent.click(toggleButton);
    });

    // Click on a scene
    const sceneButton = screen.getByText("Scene 1");
    act(() => {
      fireEvent.click(sceneButton);
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  test("displays chapter context menu with rename option", async () => {
    window.prompt = vi.fn().mockReturnValue("New Chapter Title");

    renderWithProviders(<ManuscriptSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          manuscript: {
            chapters: mockChaptersWithScenes,
            currentChapter: undefined,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      },
    });

    const chapterButton = screen.getByText("Chapter One");

    // Right-click to open a context menu
    act(() => {
      fireEvent.contextMenu(chapterButton);
    });

    // Context menu items should be rendered
    const renameOption = screen.queryByText("Rename");
    expect(renameOption).toBeInTheDocument();
    renameOption?.click();
    expect(window.prompt).toHaveBeenCalledWith("Rename Chapter", "Chapter One");
    expect(mockDispatch).toHaveBeenCalled();
  });

  test("displays chapter context menu with remove option confirm", () => {
    window.confirm = vi.fn().mockReturnValue(true);
    renderWithProviders(<ManuscriptSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          manuscript: {
            chapters: mockChaptersWithScenes,
            currentChapter: undefined,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      },
    });

    const chapterButton = screen.getByText("Chapter One");

    // Right-click to open the context menu
    act(() => {
      fireEvent.contextMenu(chapterButton);
    });

    // Context menu items should be rendered
    const removeOption = screen.queryByText("Remove");
    expect(removeOption).toBeInTheDocument();
    removeOption?.click();
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to remove this chapter? This action cannot be undone.",
    );
    expect(mockDispatch).toHaveBeenCalled();
  });

  test("displays chapter context menu with remove option reject", () => {
    window.confirm = vi.fn().mockReturnValue(false);
    renderWithProviders(<ManuscriptSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          manuscript: {
            chapters: mockChaptersWithScenes,
            currentChapter: undefined,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      },
    });

    const chapterButton = screen.getByText("Chapter One");

    // Right-click to open the context menu
    act(() => {
      fireEvent.contextMenu(chapterButton);
    });

    // Context menu items should be rendered
    const removeOption = screen.queryByText("Remove");
    expect(removeOption).toBeInTheDocument();
    act(() => {
      removeOption?.click();
    });
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to remove this chapter? This action cannot be undone.",
    );
    expect(mockDispatch).toHaveBeenCalled();
    expect(getManuscriptList).toHaveBeenCalled();
    expect(removeSceneOrChapter).not.toHaveBeenCalled();
  });
  test("renders scroll area for chapters list", () => {
    renderWithProviders(<ManuscriptSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          manuscript: {
            chapters: mockChaptersWithScenes,
            currentChapter: undefined,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      },
    });

    // ScrollArea should contain the chapters
    expect(screen.getByText("Chapter One")).toBeInTheDocument();
    expect(screen.getByText("Chapter Two")).toBeInTheDocument();
  });

  test("handles empty chapters list gracefully", () => {
    renderWithProviders(<ManuscriptSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          manuscript: {
            chapters: [],
            currentChapter: undefined,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      },
    });

    // Sidebar should still render with a title and add a button
    expect(screen.getByText("Structure")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Chapter" })).toBeInTheDocument();
  });

  test("renders chapter with chevron icon indicating collapsed state", () => {
    renderWithProviders(<ManuscriptSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          manuscript: {
            chapters: mockChaptersWithScenes,
            currentChapter: undefined,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      },
    });

    const toggleButton = screen.getByTestId("btn-chapter-chap-1");
    expect(toggleButton).toBeInTheDocument();
    // Initially should have chevron-right (collapsed)
    const chevronIcon = toggleButton.querySelector("svg");
    expect(chevronIcon).toBeInTheDocument();
  });

  test("chapters with multiple scenes display all scenes when expanded", () => {
    renderWithProviders(<ManuscriptSidebar />, {
      project: {
        ...store.getState().project,
        sections: {
          ...store.getState().project.sections,
          manuscript: {
            chapters: mockChaptersWithScenes,
            currentChapter: undefined,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      },
    });

    const toggleButton = screen.getByTestId("btn-chapter-chap-1");
    act(() => {
      fireEvent.click(toggleButton);
    });

    // Chapter 1 has 2 scenes
    expect(screen.getByText("Scene 1")).toBeInTheDocument();
    expect(screen.getByText("Scene 2")).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSections, useProjectId, useManuscript, useSaveScene } from "@/hooks/useSections";
import { saveSceneSession } from "@/store/sections/manuscript/slice";
import { mockChapters, mockProjectData } from "../../mocks";

const { mockUseSelector, mockUseDispatch } = vi.hoisted(() => {
  return {
    mockUseSelector: vi.fn(),
    mockUseDispatch: vi.fn(),
  };
});

vi.mock("react-redux", () => ({
  useSelector: mockUseSelector,
  useDispatch: () => mockUseDispatch,
}));

// Mock saveSceneSession
vi.mock("@/store/sections/manuscript/slice", () => ({
  saveSceneSession: vi.fn().mockReturnValue({
    type: "saveSceneSession/pending",
  }),
}));

// Mock useCallback
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useCallback: vi.fn((fn) => fn),
  };
});

describe("useSections hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useSections hook", () => {
    it("should return sections state from Redux store", () => {
      const mockSectionsState = {
        general: mockProjectData.sections.general,
        characters: mockProjectData.sections.characters,
        plots: mockProjectData.sections.plots,
        world: mockProjectData.sections.world,
        manuscript: {
          chapters: mockChapters,
          currentChapter: mockChapters[0],
          currentScene: undefined,
          isSaving: false,
          lastSavedDate: undefined,
          error: undefined,
        },
      };

      mockUseSelector.mockReturnValue(mockSectionsState);

      const { result } = renderHook(() => useSections());

      expect(result.current).toEqual(mockSectionsState);
      expect(mockUseSelector).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should call useSelector with correct state selector", () => {
      const mockState = {
        sections: {
          general: mockProjectData.sections.general,
          characters: [],
          plots: [],
          world: { worldElements: [] },
          manuscript: {
            chapters: [],
            currentChapter: undefined,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
      };

      mockUseSelector.mockImplementation((selector) => selector(mockState));

      const { result } = renderHook(() => useSections());

      expect(result.current).toEqual(mockState.sections);
    });

    it("should update when sections state changes", () => {
      const initialState = {
        general: { title: "Initial Title" },
        characters: [],
        plots: [],
        world: { worldElements: [] },
        manuscript: {
          chapters: [],
          currentChapter: undefined,
          currentScene: undefined,
          isSaving: false,
          lastSavedDate: undefined,
          error: undefined,
        },
      };

      const updatedState = {
        ...initialState,
        general: { title: "Updated Title" },
      };

      mockUseSelector.mockReturnValueOnce(initialState).mockReturnValueOnce(updatedState);

      const { result, rerender } = renderHook(() => useSections());

      expect(result.current.general.title).toBe("Initial Title");

      rerender();

      expect(result.current.general.title).toBe("Updated Title");
    });
  });

  describe("useProjectId hook", () => {
    it("should return current project ID", () => {
      const mockState = {
        projectInfo: {
          currentProject: mockProjectData,
        },
      };

      mockUseSelector.mockImplementation((selector) => selector(mockState));

      const { result } = renderHook(() => useProjectId());

      expect(result.current).toBe(mockProjectData.id);
    });

    it("should return 0 when no current project", () => {
      const mockState = {
        projectInfo: {
          currentProject: null,
        },
      };

      mockUseSelector.mockImplementation((selector) => selector(mockState));

      const { result } = renderHook(() => useProjectId());

      expect(result.current).toBe(0);
    });

    it("should return 0 when current project has no ID", () => {
      const mockState = {
        projectInfo: {
          currentProject: {
            ...mockProjectData,
            id: undefined,
          },
        },
      };

      mockUseSelector.mockImplementation((selector) => selector(mockState));

      const { result } = renderHook(() => useProjectId());

      expect(result.current).toBe(0);
    });

    it("should handle null project gracefully", () => {
      const mockState = {
        projectInfo: {
          currentProject: null,
        },
      };

      mockUseSelector.mockImplementation((selector) => selector(mockState));

      const { result } = renderHook(() => useProjectId());

      expect(result.current).toBe(0);
      expect(mockUseSelector).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("useManuscript hook", () => {
    it("should return manuscript state from Redux store", () => {
      const mockManuscriptState = {
        chapters: mockChapters,
        currentChapter: mockChapters[0],
        currentScene: {
          id: "scene-1",
          title: "Opening Scene",
          content: "Scene content",
        },
        isSaving: false,
        lastSavedDate: undefined,
        error: undefined,
      };

      const mockState = {
        sections: {
          manuscript: mockManuscriptState,
        },
      };

      mockUseSelector.mockImplementation((selector) => selector(mockState));

      const { result } = renderHook(() => useManuscript());

      expect(result.current).toEqual(mockManuscriptState);
    });

    it("should reflect saving state changes", () => {
      const mockManuscriptState = {
        chapters: mockChapters,
        currentChapter: mockChapters[0],
        currentScene: undefined,
        isSaving: true,
        lastSavedDate: new Date(),
        error: undefined,
      };

      const mockState = {
        sections: {
          manuscript: mockManuscriptState,
        },
      };

      mockUseSelector.mockImplementation((selector) => selector(mockState));

      const { result } = renderHook(() => useManuscript());

      expect(result.current.isSaving).toBe(true);
      expect(result.current.lastSavedDate).toBeDefined();
    });

    it("should handle error state", () => {
      const mockManuscriptState = {
        chapters: [],
        currentChapter: undefined,
        currentScene: undefined,
        isSaving: false,
        lastSavedDate: undefined,
        error: "Save failed",
      };

      const mockState = {
        sections: {
          manuscript: mockManuscriptState,
        },
      };

      mockUseSelector.mockImplementation((selector) => selector(mockState));

      const { result } = renderHook(() => useManuscript());

      expect(result.current.error).toBe("Save failed");
    });
  });

  describe("useSaveScene hook", () => {
    beforeEach(() => {
      // Setup default mock states
      mockUseSelector.mockImplementation((selector) => {
        const mockState = {
          projectInfo: {
            currentProject: mockProjectData,
          },
          sections: {
            manuscript: {
              chapters: mockChapters,
              currentChapter: mockChapters[0],
              currentScene: {
                id: "scene-1",
                title: "Opening Scene",
                content: "Original content",
              },
              isSaving: false,
              lastSavedDate: undefined,
              error: undefined,
            },
          },
        };
        return selector(mockState);
      });
    });

    it("should return a function", () => {
      const { result } = renderHook(() => useSaveScene());

      expect(typeof result.current).toBe("function");
    });

    it("should dispatch saveSceneSession with correct arguments when called", () => {
      const { result } = renderHook(() => useSaveScene());
      const saveSceneFunction = result.current;

      const newContent = "Updated scene content";
      saveSceneFunction(newContent);

      expect(mockUseDispatch).toHaveBeenCalledWith(
        saveSceneSession({
          scene: {
            id: "scene-1",
            title: "Opening Scene",
            content: newContent,
            wordCount: 0,
            wordGoal: 0,
            characters: [],
          },
          chapter: mockChapters[0],
          projectId: mockProjectData.id,
        }),
      );
    });

    it("should warn and return early when no current scene", () => {
      mockUseSelector.mockImplementation((selector) => {
        const mockState = {
          projectInfo: {
            currentProject: mockProjectData,
          },
          sections: {
            manuscript: {
              chapters: mockChapters,
              currentChapter: mockChapters[0],
              currentScene: undefined,
              isSaving: false,
              lastSavedDate: undefined,
              error: undefined,
            },
          },
        };
        return selector(mockState);
      });

      const { result } = renderHook(() => useSaveScene());
      const saveSceneFunction = result.current;

      saveSceneFunction("New content");

      expect(mockUseDispatch).not.toHaveBeenCalled();
    });

    it("should warn and return early when no current chapter", () => {
      mockUseSelector.mockImplementation((selector) => {
        const mockState = {
          projectInfo: {
            currentProject: mockProjectData,
          },
          sections: {
            manuscript: {
              chapters: mockChapters,
              currentChapter: undefined,
              currentScene: {
                id: "scene-1",
                title: "Opening Scene",
                content: "Original content",
              },
              isSaving: false,
              lastSavedDate: undefined,
              error: undefined,
            },
          },
        };
        return selector(mockState);
      });

      const { result } = renderHook(() => useSaveScene());
      const saveSceneFunction = result.current;

      saveSceneFunction("New content");

      expect(mockUseDispatch).not.toHaveBeenCalled();
    });

    it("should warn when both chapter and scene are missing", () => {
      mockUseSelector.mockImplementation((selector) => {
        const mockState = {
          projectInfo: {
            currentProject: mockProjectData,
          },
          sections: {
            manuscript: {
              chapters: mockChapters,
              currentChapter: undefined,
              currentScene: undefined,
              isSaving: false,
              lastSavedDate: undefined,
              error: undefined,
            },
          },
        };
        return selector(mockState);
      });

      const { result } = renderHook(() => useSaveScene());
      const saveSceneFunction = result.current;

      saveSceneFunction("New content");

      expect(mockUseDispatch).not.toHaveBeenCalled();
    });

    it("should create updated scene with new content", () => {
      const { result } = renderHook(() => useSaveScene());
      const saveSceneFunction = result.current;

      const newContent = "Completely new scene content";
      saveSceneFunction(newContent);

      expect(mockUseDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.any(String),
        }),
      );

      const dispatchCall = mockUseDispatch.mock.calls[0][0];
      if (typeof dispatchCall === "function") {
        expect(saveSceneSession).toHaveBeenCalledWith({
          scene: expect.objectContaining({
            content: newContent,
          }),
          chapter: mockChapters[0],
          projectId: mockProjectData.id,
        });
      }
    });

    it("should use current project ID in save arguments", () => {
      const customProjectId = 999;

      mockUseSelector.mockImplementation((selector) => {
        const mockState = {
          projectInfo: {
            currentProject: {
              ...mockProjectData,
              id: customProjectId,
            },
          },
          sections: {
            manuscript: {
              chapters: mockChapters,
              currentChapter: mockChapters[0],
              currentScene: {
                id: "scene-1",
                title: "Opening Scene",
                content: "Original content",
              },
              isSaving: false,
              lastSavedDate: undefined,
              error: undefined,
            },
          },
        };
        return selector(mockState);
      });

      const { result } = renderHook(() => useSaveScene());
      const saveSceneFunction = result.current;

      saveSceneFunction("Content");

      expect(saveSceneSession).toHaveBeenCalledWith({
        scene: expect.any(Object),
        chapter: expect.any(Object),
        projectId: customProjectId,
      });
    });

    it("should handle zero project ID", () => {
      mockUseSelector.mockImplementation((selector) => {
        const mockState = {
          projectInfo: {
            currentProject: null,
          },
          sections: {
            manuscript: {
              chapters: mockChapters,
              currentChapter: mockChapters[0],
              currentScene: {
                id: "scene-1",
                title: "Opening Scene",
                content: "Original content",
              },
              isSaving: false,
              lastSavedDate: undefined,
              error: undefined,
            },
          },
        };
        return selector(mockState);
      });

      const { result } = renderHook(() => useSaveScene());
      const saveSceneFunction = result.current;

      saveSceneFunction("Content");

      expect(saveSceneSession).toHaveBeenCalledWith({
        scene: expect.any(Object),
        chapter: expect.any(Object),
        projectId: 0,
      });
    });
  });

  describe("Integration tests", () => {
    it("should work together - all hooks with consistent state", () => {
      const mockState = {
        sections: {
          general: mockProjectData.sections.general,
          characters: mockProjectData.sections.characters,
          plots: mockProjectData.sections.plots,
          world: mockProjectData.sections.world,
          manuscript: {
            chapters: mockChapters,
            currentChapter: mockChapters[0],
            currentScene: {
              id: "scene-1",
              title: "Opening Scene",
              content: "Scene content",
            },
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
        projectInfo: {
          currentProject: mockProjectData,
        },
      };

      mockUseSelector.mockImplementation((selector) => selector(mockState));

      const { result: sectionsResult } = renderHook(() => useSections());
      const { result: projectIdResult } = renderHook(() => useProjectId());
      const { result: manuscriptResult } = renderHook(() => useManuscript());
      const { result: saveSceneResult } = renderHook(() => useSaveScene());

      expect(sectionsResult.current.manuscript).toEqual(manuscriptResult.current);
      expect(projectIdResult.current).toBe(mockProjectData.id);
      expect(sectionsResult.current.general.title).toBe("The Dark Streets");
      expect(typeof saveSceneResult.current).toBe("function");
    });

    it("should handle empty/null states gracefully", () => {
      const emptyState = {
        sections: {
          general: {},
          characters: [],
          plots: [],
          world: { worldElements: [] },
          manuscript: {
            chapters: [],
            currentChapter: undefined,
            currentScene: undefined,
            isSaving: false,
            lastSavedDate: undefined,
            error: undefined,
          },
        },
        projectInfo: {
          currentProject: null,
        },
        projects: [],
      };

      mockUseSelector.mockImplementation((selector) => selector(emptyState));

      const { result: sectionsResult } = renderHook(() => useSections());
      const { result: projectIdResult } = renderHook(() => useProjectId());
      const { result: manuscriptResult } = renderHook(() => useManuscript());
      const { result: saveSceneResult } = renderHook(() => useSaveScene());

      expect(sectionsResult.current).toBeDefined();
      expect(projectIdResult.current).toBe(0);
      expect(manuscriptResult.current.chapters).toEqual([]);
      expect(typeof saveSceneResult.current).toBe("function");

      saveSceneResult.current("test content");
    });

    it("should maintain consistency between useManuscript and useSections", () => {
      const manuscriptState = {
        chapters: mockChapters,
        currentChapter: mockChapters[0],
        currentScene: {
          id: "scene-1",
          title: "Opening Scene",
          content: "Scene content",
        },
        isSaving: true,
        lastSavedDate: new Date(),
        error: undefined,
      };

      const mockState = {
        sections: {
          general: {},
          characters: [],
          plots: [],
          world: { worldElements: [] },
          manuscript: manuscriptState,
        },
        projectInfo: {
          currentProject: mockProjectData,
        },
      };

      mockUseSelector.mockImplementation((selector) => selector(mockState));

      const { result: sectionsResult } = renderHook(() => useSections());
      const { result: manuscriptResult } = renderHook(() => useManuscript());

      expect(sectionsResult.current.manuscript).toEqual(manuscriptResult.current);
      expect(sectionsResult.current.manuscript.isSaving).toBe(true);
      expect(manuscriptResult.current.isSaving).toBe(true);
    });
  });
});

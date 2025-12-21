import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import {
  saveSceneSession,
  addChapterAndSaveScene,
  SaveSceneArgs,
  getManuscriptList,
} from "@/store/sections/manuscript/slice";
import { mockChapters } from "../../../../mocks";
import { Scene } from "@/types/sections";

// Mock fetch globally
global.fetch = vi.fn();

// Mock the useSections hook
vi.mock("@/hooks/useSections.ts", () => ({
  useProjectId: vi.fn(() => 1),
}));

vi.mock("@/store/electron/actions", () => ({
  getManuscriptListFromStore: vi.fn(),
  setManuscriptListToStore: vi.fn(),
}));

const { getManuscriptListFromStore, setManuscriptListToStore } = await import(
  "@/store/electron/actions"
);
const mockedGetManuscriptListFromStore = getManuscriptListFromStore as ReturnType<typeof vi.fn>;
const mockedSetManuscriptListToStore = setManuscriptListToStore as ReturnType<typeof vi.fn>;

const mockedFetch = fetch as ReturnType<typeof vi.fn<typeof fetch>>;

function createMockResponse<T>(data: T, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? "OK" : "Internal Server Error",
    json: vi.fn().mockResolvedValue(data),
    headers: new Headers(),
    redirected: false,
    type: "basic",
    url: "",
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
    formData: vi.fn(),
    text: vi.fn(),
  } as unknown as Response;
}

// Create a mock store for testing thunks
const createMockStore = () => {
  return configureStore({
    reducer: {
      test: (state = {}) => state,
    },
  });
};

describe("ManuscriptSlice", () => {
  let store: ReturnType<typeof createMockStore>;

  const mockScene: Scene = {
    path: "scene-1",
    title: "Opening Scene",
    content: "It was a dark and stormy night...",
  };

  const mockChapterWithScenes = {
    ...mockChapters[0],
    scenes: [mockScene],
  };

  const mockSaveSceneArgs: SaveSceneArgs = {
    scene: mockScene,
    chapter: mockChapterWithScenes,
    projectId: 1,
  };

  beforeEach(() => {
    store = createMockStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("saveSceneSession", () => {
    test("should handle successful save scene session", async () => {
      // Mock successful API responses
      const mockSessionId = "session-123";
      const mockStartResponse = { session_id: mockSessionId };
      const mockFinishResponse = { success: true };

      mockedFetch
        .mockResolvedValueOnce(createMockResponse(mockStartResponse))
        .mockResolvedValueOnce(createMockResponse({}))
        .mockResolvedValueOnce(createMockResponse(mockFinishResponse));

      const action = saveSceneSession(mockSaveSceneArgs);
      const result = await store.dispatch(action);

      expect(result.type).toBe(saveSceneSession.fulfilled.type);
      expect(result.payload).toEqual({
        lastSaved: expect.any(Date),
      });

      // Verify API calls
      expect(fetch).toHaveBeenCalledTimes(3);

      // Check start session call
      expect(fetch).toHaveBeenCalledWith("/api/manuscript/save/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: 1,
          relative_path: mockChapterWithScenes.title,
          filename: `${mockScene.title}.md`,
        }),
      });

      // Check chunk save call
      expect(fetch).toHaveBeenCalledWith(`/api/manuscript/save/chunk/${mockSessionId}`, {
        method: "POST",
        body: expect.any(FormData),
      });

      // Check finish session call
      expect(fetch).toHaveBeenCalledWith(`/api/manuscript/save/finish/${mockSessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    });

    test("should handle failed start session", async () => {
      // Mock failed start session
      mockedFetch.mockRejectedValueOnce(new Error("Network error"));

      const action = saveSceneSession(mockSaveSceneArgs);
      const result = await store.dispatch(action);

      expect(result.type).toBe(saveSceneSession.rejected.type);
      expect(result.payload).toBe("Failed to save scene x.x");
    });

    test("should handle failed finish session", async () => {
      const mockSessionId = "session-123";

      mockedFetch
        .mockResolvedValueOnce(createMockResponse({ session_id: mockSessionId }))
        .mockResolvedValueOnce(createMockResponse({}))
        .mockResolvedValueOnce(
          createMockResponse(
            {
              status: 500,
              statusText: "Internal Server Error",
              json: vi.fn().mockResolvedValue({}),
            },
            false,
          ),
        );

      const action = saveSceneSession(mockSaveSceneArgs);
      const result = await store.dispatch(action);

      expect(result.type).toBe(saveSceneSession.rejected.type);
      expect(result.payload).toBe("Failed to save scene x.x");
    });

    test("should create correct FormData for chunk save", async () => {
      const mockSessionId = "session-123";

      mockedFetch
        .mockResolvedValueOnce(createMockResponse({ session_id: mockSessionId }))
        .mockResolvedValueOnce(createMockResponse({}))
        .mockResolvedValueOnce(createMockResponse({ success: true, ok: true }));

      const action = saveSceneSession(mockSaveSceneArgs);
      await store.dispatch(action);

      // Get the FormData from the second fetch call
      const chunkCall = mockedFetch.mock.calls[1];
      expect(chunkCall).toBeDefined();

      const formData = chunkCall[1]?.body;

      expect(formData).toBeInstanceOf(FormData);
      // Note: FormData contents are hard to test directly due to browser API limitations
    });

    test("should use correct file naming convention", async () => {
      const sceneWithSpecialTitle: Scene = {
        ...mockScene,
        title: "Scene With Spaces",
      };

      const argsWithSpecialTitle = {
        ...mockSaveSceneArgs,
        scene: sceneWithSpecialTitle,
      };

      mockedFetch
        .mockResolvedValueOnce(createMockResponse({ session_id: "test", ok: true }))
        .mockResolvedValueOnce(createMockResponse({ ok: true }))
        .mockResolvedValueOnce(createMockResponse({ success: true, ok: true }));

      const action = saveSceneSession(argsWithSpecialTitle);
      await store.dispatch(action);

      expect(mockedFetch).toHaveBeenCalledTimes(3);

      const startCall = mockedFetch.mock.calls[0]!;
      const requestBody = JSON.parse(startCall[1]!.body as string);

      expect(requestBody.filename).toBe("Scene With Spaces.md");
      expect(requestBody.relative_path).toBe(mockChapterWithScenes.title);
      expect(requestBody.project_id).toBe(1);
    });
  });

  describe("addChapterAndSaveScene", () => {
    test("should dispatch addChapter and saveSceneSession", async () => {
      // Mock successful save scene session
      mockedFetch
        .mockResolvedValueOnce(createMockResponse({ session_id: "session-123", ok: true }))
        .mockResolvedValueOnce(createMockResponse({ ok: true }))
        .mockResolvedValueOnce(createMockResponse({ success: true, ok: true }));

      const action = addChapterAndSaveScene(mockChapterWithScenes);
      const result = await store.dispatch(action);

      expect(result.type).toBe(addChapterAndSaveScene.fulfilled.type);
    });

    test("should handle chapter without scenes", async () => {
      const chapterWithoutScenes = {
        ...mockChapters[0],
        scenes: [],
      };

      const action = addChapterAndSaveScene(chapterWithoutScenes);
      try {
        await store.dispatch(action);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Action creators", () => {
    test("saveSceneSession should create correct action structure", async () => {
      const dispatch = vi.fn();
      const getState = vi.fn();

      const mockSessionId = "session-123";

      // mock de fetch
      mockedFetch
        .mockResolvedValueOnce(createMockResponse({ session_id: mockSessionId }))
        .mockResolvedValueOnce(createMockResponse({})) // chunk save
        .mockResolvedValueOnce(createMockResponse({ success: true })); // finish save

      // ejecutar el thunk
      const thunkAction = saveSceneSession(mockSaveSceneArgs);
      const result = await thunkAction(dispatch, getState, undefined);

      // validar tipo final
      expect(result.type).toBe(saveSceneSession.fulfilled.type);

      // validar que el argumento se pasó correctamente
      expect(result.meta.arg).toEqual(mockSaveSceneArgs);

      // validar que fetch se llamó 3 veces
      expect(mockedFetch).toHaveBeenCalledTimes(3);

      // validar primer fetch (start session)
      const startCall = mockedFetch.mock.calls[0]!;
      const startBody = JSON.parse(startCall[1]!.body as string);

      expect(startBody.project_id).toBe(mockSaveSceneArgs.projectId);
      expect(startBody.relative_path).toBe(mockSaveSceneArgs.chapter.title);
      expect(startBody.filename).toBe(`${mockSaveSceneArgs.scene.title}.md`);
    });

    test("addChapterAndSaveScene should create correct action structure", async () => {
      const arg = mockChapterWithScenes;

      const dispatch = vi.fn();
      const getState = vi.fn();

      const thunkAction = addChapterAndSaveScene(arg);
      const result = await thunkAction(dispatch, getState, undefined);

      expect(result.type).toBe("Section [Manuscript] Add Chapter and Save Scene/fulfilled");
      expect(result.meta.arg).toEqual(arg);
    });
  });

  describe("Error handling", () => {
    test("should handle network errors gracefully", async () => {
      mockedFetch.mockRejectedValueOnce(new Error("Failed to fetch"));

      const action = saveSceneSession(mockSaveSceneArgs);
      const result = await store.dispatch(action);

      expect(result.type).toBe(saveSceneSession.rejected.type);
      expect(result.payload).toBe("Failed to save scene x.x");
    });

    test("should handle malformed API responses", async () => {
      mockedFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
        }),
      );

      const action = saveSceneSession(mockSaveSceneArgs);
      const result = await store.dispatch(action);

      expect(result.type).toBe(saveSceneSession.rejected.type);
      expect(result.payload).toBe("Failed to save scene x.x");
    });

    test("should handle HTTP error responses", async () => {
      mockedFetch.mockResolvedValueOnce(
        createMockResponse(
          {
            status: 500,
            statusText: "Internal Server Error",
            json: vi.fn().mockResolvedValue({ error: "Server error" }),
          },
          false,
        ),
      );

      const action = saveSceneSession(mockSaveSceneArgs);
      const result = await store.dispatch(action);

      expect(result.type).toBe(saveSceneSession.rejected.type);
      expect(result.payload).toBe("Failed to save scene x.x");
    });
  });

  describe("Integration scenarios", () => {
    test("should handle complete save workflow", async () => {
      const mockSessionId = "session-456";

      mockedFetch
        .mockResolvedValueOnce(
          createMockResponse({
            ok: true,
            json: vi.fn().mockResolvedValue({ session_id: mockSessionId }),
          }),
        )
        .mockResolvedValueOnce(
          createMockResponse({
            ok: true,
            status: 200,
          }),
        )
        .mockResolvedValueOnce(
          createMockResponse({
            ok: true,
            json: vi.fn().mockResolvedValue({ success: true, saved_at: new Date().toISOString() }),
          }),
        );

      const action = saveSceneSession(mockSaveSceneArgs);
      const result = await store.dispatch(action);

      expect(result.type).toBe(saveSceneSession.fulfilled.type);
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    test("should handle large content saves", async () => {
      const largeContent = "x".repeat(10000); // 10KB of content
      const largeScene: Scene = {
        ...mockScene,
        content: largeContent,
      };

      const largeArgs: SaveSceneArgs = {
        ...mockSaveSceneArgs,
        scene: largeScene,
      };

      mockedFetch
        .mockResolvedValueOnce(
          createMockResponse({
            ok: true,
            json: vi.fn().mockResolvedValue({ session_id: "large-session" }),
          }),
        )
        .mockResolvedValueOnce(
          createMockResponse({
            ok: true,
          }),
        )
        .mockResolvedValueOnce(
          createMockResponse({
            ok: true,
            json: vi.fn().mockResolvedValue({ success: true }),
          }),
        );

      const action = saveSceneSession(largeArgs);
      const result = await store.dispatch(action);

      expect(result.type).toBe(saveSceneSession.fulfilled.type);
    });
  });

  describe("getManuscriptList", () => {
    const mockProjectId = 123;
    const mockManuscriptListResponse = {
      path: "project-123",
      chapters: mockChapters,
    };

    test("should handle successful manuscript list retrieval from store", async () => {
      // Mock successful store retrieval
      mockedGetManuscriptListFromStore.mockResolvedValueOnce(mockManuscriptListResponse);

      const action = getManuscriptList(mockProjectId);
      const result = await store.dispatch(action);

      expect(result.type).toBe(getManuscriptList.fulfilled.type);
      expect(result.payload).toEqual(mockManuscriptListResponse);

      // Verify store was checked
      expect(mockedGetManuscriptListFromStore).toHaveBeenCalledWith(mockProjectId);

      // Should not call API when found in store
      expect(fetch).not.toHaveBeenCalled();
    });

    test("should fetch from API when not found in store", async () => {
      // Mock empty store
      mockedGetManuscriptListFromStore.mockResolvedValueOnce(null);

      // Mock successful API response
      mockedFetch.mockResolvedValueOnce(createMockResponse(mockManuscriptListResponse));

      // Mock successful store save
      mockedSetManuscriptListToStore.mockResolvedValueOnce(undefined);

      const action = getManuscriptList(mockProjectId);
      const result = await store.dispatch(action);

      expect(result.type).toBe(getManuscriptList.fulfilled.type);
      expect(result.payload).toEqual(mockManuscriptListResponse);

      // Verify store was checked
      expect(mockedGetManuscriptListFromStore).toHaveBeenCalledWith(mockProjectId);

      // Verify API was called
      expect(fetch).toHaveBeenCalledWith(`/api/manuscript/list/${mockProjectId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Verify result was saved to store
      expect(mockedSetManuscriptListToStore).toHaveBeenCalledWith(
        mockProjectId,
        mockManuscriptListResponse,
      );
    });

    test("should handle API failure", async () => {
      // Mock empty store
      mockedGetManuscriptListFromStore.mockResolvedValueOnce(null);

      // Mock failed API response
      mockedFetch.mockResolvedValueOnce(createMockResponse(null, false));

      const action = getManuscriptList(mockProjectId);
      const result = await store.dispatch(action);

      expect(result.type).toBe(getManuscriptList.rejected.type);
      expect(result.payload).toBe("Failed to retrieve manuscript list");

      // Verify store was checked
      expect(mockedGetManuscriptListFromStore).toHaveBeenCalledWith(mockProjectId);

      // Verify API was called
      expect(fetch).toHaveBeenCalledWith(`/api/manuscript/list/${mockProjectId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Should not save to store on failure
      expect(mockedSetManuscriptListToStore).not.toHaveBeenCalled();
    });

    test("should handle network errors", async () => {
      // Mock empty store
      mockedGetManuscriptListFromStore.mockResolvedValueOnce(null);

      // Mock network error
      mockedFetch.mockRejectedValueOnce(new Error("Network error"));

      const action = getManuscriptList(mockProjectId);
      const result = await store.dispatch(action);

      expect(result.type).toBe(getManuscriptList.rejected.type);
    });

    test("should handle store retrieval errors", async () => {
      // Mock store error
      mockedGetManuscriptListFromStore.mockRejectedValueOnce(new Error("Store error"));

      const action = getManuscriptList(mockProjectId);
      const result = await store.dispatch(action);

      expect(result.type).toBe(getManuscriptList.rejected.type);
    });

    test("should create correct action structure", async () => {
      const dispatch = vi.fn();
      const getState = vi.fn();

      // Mock successful store retrieval
      mockedGetManuscriptListFromStore.mockResolvedValueOnce(mockManuscriptListResponse);

      const thunkAction = getManuscriptList(mockProjectId);
      const result = await thunkAction(dispatch, getState, undefined);

      expect(result.type).toBe(getManuscriptList.fulfilled.type);
      expect(result.meta.arg).toBe(mockProjectId);
      expect(result.payload).toEqual(mockManuscriptListResponse);
    });

    test("should handle different project IDs correctly", async () => {
      const projectId1 = 100;
      const projectId2 = 200;

      const response1 = { ...mockManuscriptListResponse, path: "project-100" };
      const response2 = { ...mockManuscriptListResponse, path: "project-200" };

      // First project
      mockedGetManuscriptListFromStore.mockResolvedValueOnce(response1);

      const action1 = getManuscriptList(projectId1);
      const result1 = await store.dispatch(action1);

      expect(result1.payload).toEqual(response1);
      expect(mockedGetManuscriptListFromStore).toHaveBeenCalledWith(projectId1);

      // Second project
      mockedGetManuscriptListFromStore.mockResolvedValueOnce(null);
      mockedFetch.mockResolvedValueOnce(createMockResponse(response2));
      mockedSetManuscriptListToStore.mockResolvedValueOnce(undefined);

      const action2 = getManuscriptList(projectId2);
      const result2 = await store.dispatch(action2);

      expect(result2.payload).toEqual(response2);
      expect(fetch).toHaveBeenCalledWith(`/api/manuscript/list/${projectId2}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    });

    test("should handle zero project ID", async () => {
      mockedGetManuscriptListFromStore.mockResolvedValueOnce(null);
      mockedFetch.mockResolvedValueOnce(createMockResponse(mockManuscriptListResponse));
      mockedSetManuscriptListToStore.mockResolvedValueOnce(undefined);

      const action = getManuscriptList(0);
      const result = await store.dispatch(action);

      expect(result.type).toBe(getManuscriptList.fulfilled.type);
      expect(fetch).toHaveBeenCalledWith("/api/manuscript/list/0", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
  });
});

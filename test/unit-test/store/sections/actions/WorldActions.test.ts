import { describe, expect, test, vi, beforeEach } from "vitest";
import {
  removeWorldElement,
  updateWorldElement,
  addWorldElement,
  setCurrentWorldElement,
} from "@/store/sections/world/actions";
import { IWorldElement } from "@/types/sections";
import { mockWorldElements } from "../../../../mocks";

// --- Setup global fetch mock ---
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("World API Actions", () => {
  test("removeWorldElement - success", async () => {
    const mockResponse = { id: 1, success: true };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await removeWorldElement(1)(vi.fn(), vi.fn(), {});
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/world/element/1"),
      expect.objectContaining({
        method: "DELETE",
      }),
    );
    expect(result.payload).toEqual(mockResponse);
  });

  test("removeWorldElement - error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    const result = await removeWorldElement(1)(vi.fn(), vi.fn(), {});
    expect(result.type).toBe(removeWorldElement.rejected.type);
  });

  test("updateWorldElement - success", async () => {
    const element: Partial<IWorldElement> = { id: 2, name: "Updated Name" };
    const mockResponse = { ...element, description: "New description" };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await updateWorldElement(element)(vi.fn(), vi.fn(), {});
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/world/element/2"),
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ name: "Updated Name" }),
      }),
    );
    expect(result.payload).toEqual(mockResponse);
  });

  test("updateWorldElement - error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    const result = await removeWorldElement(1)(vi.fn(), vi.fn(), {});
    expect(result.type).toBe(removeWorldElement.rejected.type);
  });

  test("addWorldElement - success", async () => {
    const mockResponse: IWorldElement = {
      id: 3,
      name: "New Element",
      parentId: null,
      description: "",
      origin: "",
      conflictCause: "",
      worldId: 0,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await addWorldElement(10)(vi.fn(), vi.fn(), {});
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/world/element"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ worldId: 10 }),
      }),
    );
    expect(result.payload).toEqual(mockResponse);
  });

  test("addWorldElement - error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    const result = await addWorldElement(10)(vi.fn(), vi.fn(), {});
    expect(result.type).toBe(addWorldElement.rejected.type);
  });

  test("setCurrentWorldElement - creates correct action", () => {
    const action = setCurrentWorldElement(mockWorldElements[0]);
    expect(action.type).toBe("Section [World] Set Current World Element");
    expect(action.payload).toEqual(mockWorldElements[0]);
  });
});

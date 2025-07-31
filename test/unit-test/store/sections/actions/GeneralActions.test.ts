import { host } from "@/https/fetch";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { requestGeneral, updateGeneral } from "@/store";
import { mockGeneral } from "../../../../mocks";

describe("updateGeneral thunk", () => {
  const request: requestGeneral = {
    projectId: 42,
    general: {
      title: "New Project Title",
    },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("dispatches fulfilled action on success", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        projectName: mockGeneral.title,
        projectId: request.projectId,
        general: mockGeneral,
      }),
    });
    global.fetch = mockFetch;

    const result = await updateGeneral(request)(vi.fn(), vi.fn(), undefined);

    expect(mockFetch).toHaveBeenCalledWith(
      `${host}/projects/42/general`,
      expect.objectContaining({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request.general),
      }),
    );

    expect(result.type).toBe("[General] Update info/fulfilled");
    expect(result.payload).toEqual({
      projectName: mockGeneral.title,
      projectId: 42,
      general: mockGeneral,
    });
  });

  test("dispatches rejected action on error response", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });

    const result = await updateGeneral(request)(vi.fn(), vi.fn(), undefined);

    expect(result.type).toBe("[General] Update info/rejected");
  });

  test("dispatches rejected action on fetch throw", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const result = await updateGeneral(request)(vi.fn(), vi.fn(), undefined);

    expect(result.type).toBe("[General] Update info/rejected");
  });
});

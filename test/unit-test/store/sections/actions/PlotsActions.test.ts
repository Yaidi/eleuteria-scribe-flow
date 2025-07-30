import { describe, test, expect, vi, beforeEach } from "vitest";
import { mockPlots } from "../../../../mocks";
import { addPlot, removePlot, updatePlot } from "@/store";
import { host } from "@/https/fetch.ts";

describe("Plot async actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  const mockPlot = mockPlots[0];

  describe("updatePlot", () => {
    test("should update plot successfully", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlot,
      });

      const result = await updatePlot({ plot: { id: mockPlot.id, title: mockPlot.title } })(
        vi.fn(),
        vi.fn(),
        undefined,
      );

      expect(fetch).toHaveBeenCalledWith(
        `${host}/plot/${mockPlot.id}`,
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }),
      );
      expect(result.payload).toEqual(mockPlot);
    });

    test("should throw error on failed update", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
      });

      const result = await updatePlot({ plot: { id: mockPlot.id } })(vi.fn(), vi.fn(), undefined);
      expect(result.type).eq("[Plot] Update Plot/rejected");
    });
  });

  describe("removePlot", () => {
    test("should remove plot successfully", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
      });

      const result = await removePlot(1)(vi.fn(), vi.fn(), undefined);

      expect(fetch).toHaveBeenCalledWith(
        `${host}/plot/1`,
        expect.objectContaining({ method: "DELETE" }),
      );
      expect(result.payload).toEqual({ id: 1 });
    });

    test("should throw error on failed delete", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({ ok: false });

      const result = await removePlot(1)(vi.fn(), vi.fn(), undefined);
      expect(result.type).eq("[Plot] Remove Plot/rejected");
    });
  });

  describe("addPlot", () => {
    test("should add plot successfully", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlot,
      });

      const result = await addPlot(10)(vi.fn(), vi.fn(), undefined);

      expect(fetch).toHaveBeenCalledWith(
        `${host}/plot/`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ projectID: 10 }),
        }),
      );
      expect(result.payload).toEqual(mockPlot);
    });

    test("should throw error on failed add", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({ ok: false });

      const result = await addPlot(10)(vi.fn(), vi.fn(), undefined);
      expect(result.type).eq("[Plot] Add Plot/rejected");
    });
  });
});

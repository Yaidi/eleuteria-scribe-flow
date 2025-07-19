import { getTemplates, host, resolveHost } from "@/https/fetch.ts";
import { expect, test, vi } from "vitest";

test("fetches templates using mocked fetch", async () => {
  const mockResponse = {
    characters: ["Hero"],
    worlds: ["Fantasy"],
  };

  global.fetch = vi.fn().mockResolvedValue({
    json: vi.fn().mockResolvedValue(mockResponse),
  }) as unknown as typeof fetch;

  const result = await getTemplates();

  expect(result).toEqual(mockResponse);
  expect(fetch).toHaveBeenCalledWith(`${host}/project/templates`);
});

test("returns /api in dev mode", () => {
  expect(resolveHost(true)).toBe("/api");
});

test("returns production URL in prod mode", () => {
  expect(resolveHost(false)).toBe("http://127.0.0.1:8000");
});

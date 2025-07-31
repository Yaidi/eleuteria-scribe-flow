import { beforeEach, describe, expect, test, vi } from "vitest";
import { IProject, ProjectData, ProjectType } from "@/types/project";
import { RequestAddProject } from "@/types/requests";
import { setCurrentId } from "@/store/electron/actions";
import { mockProject, mockProjectData } from "../../../mocks";
import { addProjectFetch, getProjectFetch, projectsFetch, removeProject } from "@/store";

vi.mock("@/store/electron/actions", () => ({
  setCurrentId: vi.fn(),
}));

const mockDispatch = vi.fn();
const mockGetState = vi.fn();

describe("project thunks", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("projectsFetch", () => {
    test("fetches list of projects successfully", async () => {
      const projects: IProject[] = [mockProject];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ projects }),
      }) as never;

      const result = await projectsFetch()(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe("[Projects] Get Projects/fulfilled");
      expect(result.payload).toEqual(projects);
    });

    test("returns error if request fails", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });

      const result = await projectsFetch()(mockDispatch, mockGetState, undefined);
      expect(result.type).toBe("[Projects] Get Projects/rejected");
    });
  });

  describe("getProjectFetch", () => {
    test("fetches a project successfully", async () => {
      const project: ProjectData = mockProjectData;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => project,
      }) as never;

      const result = await getProjectFetch(1)(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe("[Project] Get Project/fulfilled");
      expect(result.payload).toEqual(project);
      expect(setCurrentId).toHaveBeenCalledWith(1);
    });

    test("returns error if request fails", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });

      const result = await getProjectFetch(1)(mockDispatch, mockGetState, undefined);
      expect(result.type).toBe("[Project] Get Project/rejected");
    });
  });

  describe("addProjectFetch", () => {
    test("adds a project successfully and sets current ID", async () => {
      const project: ProjectData = mockProjectData;
      const body: RequestAddProject = { projectListID: 1, type: ProjectType.novel };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => project,
      }) as never;

      const result = await addProjectFetch(body)(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe("[Projects] Add Project/fulfilled");
      expect(result.payload).toEqual(project);
      expect(setCurrentId).toHaveBeenCalledWith(1);
    });

    test("returns error if add project fails", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });

      const result = await addProjectFetch({ projectListID: 1, type: ProjectType.novel })(
        mockDispatch,
        mockGetState,
        undefined,
      );
      expect(result.type).toBe("[Projects] Add Project/rejected");
    });
  });

  describe("removeProject", () => {
    test("removes a project successfully", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 99 }),
      }) as never;

      const result = await removeProject(99)(mockDispatch, mockGetState, undefined);

      expect(result.type).toBe("[Project] Remove Project/fulfilled");
      expect(result.payload).toEqual({ id: 99 });
    });

    test("returns error if delete fails", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });

      const result = await removeProject(99)(mockDispatch, mockGetState, undefined);
      expect(result.type).toBe("[Project] Remove Project/rejected");
    });
  });
});

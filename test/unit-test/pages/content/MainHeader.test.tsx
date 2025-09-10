import { render, screen } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
import MainHeader from "@/pages/content/MainHeader.tsx";
import { mockProjectData } from "../../../mocks";
import { ProjectData } from "@/types/project.ts";

// Mock use-toast
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("MainHeader", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders current section and project type", () => {
    const project: ProjectData = {
      ...mockProjectData,
      sections: {
        ...mockProjectData.sections,
      },
    };
    render(<MainHeader currentProject={project} />);

    expect(screen.getByText("The Dark Streets")).toBeInTheDocument();
    expect(screen.getByText("novel")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  test("auto saves on mount", async () => {
    render(<MainHeader currentProject={mockProjectData} />);

    await new Promise((r) => setTimeout(r, 10)); // wait for autosave

    const stored = localStorage.getItem("eleuteria-project");
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(mockProjectData);
  });

  test("shows progress bar with correct percentage when wordGoal is set", () => {
    const projectWithGoal: ProjectData = {
      ...mockProjectData,
      words: 500,
      wordGoal: 1000,
    };

    render(<MainHeader currentProject={projectWithGoal} />);

    const progressRoot = screen.getByTestId("progressbar");
    expect(progressRoot).toBeInTheDocument();

    const indicator = progressRoot.querySelector("div");
    expect(indicator).not.toBeNull();
    const expectedTransform = "translateX(-50%)"; // 500/1000 => 50 %
    expect(indicator).toHaveStyle(`transform: ${expectedTransform}`);
  });
});

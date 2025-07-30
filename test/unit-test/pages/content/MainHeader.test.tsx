import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  test("saves project to localStorage when save button is clicked", async () => {
    const user = userEvent.setup();
    render(<MainHeader currentProject={mockProjectData} />);

    const button = screen.getByRole("button", { name: /save/i });
    await user.click(button);

    const stored = localStorage.getItem("eleuteria-project");
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(mockProjectData);
  });

  test("auto saves on mount", async () => {
    render(<MainHeader currentProject={mockProjectData} />);

    await new Promise((r) => setTimeout(r, 10)); // wait for autosave

    const stored = localStorage.getItem("eleuteria-project");
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(mockProjectData);
  });
});

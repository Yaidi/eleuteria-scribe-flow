import { fireEvent, render, screen } from "@testing-library/react";
import { IProject, ProjectType, Status } from "@/types/project";
import { describe, expect, test, vi } from "vitest";
import Project from "@/pages/projects/Project.tsx";

const mockProject: IProject = {
  id: 1,
  projectName: "My Project",
  description: "A test project",
  type: ProjectType.novel,
  status: Status.planning,
  words: 5000,
  wordGoal: 10000,
  created: "2025-07-29T09:52:08.710677",
  updated: "2029-07-29T09:52:08.710677",
  projectListID: 0,
};

describe("<Project />", () => {
  test("renders project info correctly", () => {
    render(<Project project={mockProject} handleRemove={vi.fn()} handleProject={vi.fn()} />);

    expect(screen.getByTestId("project")).toBeInTheDocument();
    expect(screen.getByText("My Project")).toBeInTheDocument();
    expect(screen.getByText("A test project")).toBeInTheDocument();
    expect(screen.getByText("novel")).toBeInTheDocument();
    expect(screen.getByTestId("badge-status").textContent).eq("planning");
    expect(screen.getByTestId("words-goal").textContent).eq("5000");
  });

  test("calls handleProject when 'Open Project' is clicked", () => {
    const handleProject = vi.fn();

    render(<Project project={mockProject} handleRemove={vi.fn()} handleProject={handleProject} />);

    fireEvent.click(screen.getByText("Open project"));
    expect(handleProject).toHaveBeenCalledWith(1);
  });

  test("calls handleRemove when 'Delete' is clicked", () => {
    const handleRemove = vi.fn();

    render(<Project project={mockProject} handleRemove={handleRemove} handleProject={vi.fn()} />);

    fireEvent.click(screen.getByTestId("btn-rm-project"));
    expect(handleRemove).toHaveBeenCalledWith(1, "My Project");
  });

  test("renders null if project is null", () => {
    const { container } = render(
      <Project project={null} handleRemove={vi.fn()} handleProject={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import SidebarProjects from "@/pages/projects/SidebarProjects.tsx";
import { mockProject } from "../../../mocks";

vi.mock("@/components/Sidebar.tsx", () => ({
  default: ({ children }: never) => <aside>{children}</aside>,
}));
vi.mock("@/components/ui/button.tsx", () => ({
  Button: ({ onClick, children }: never) => <button onClick={onClick}>{children}</button>,
}));
vi.mock("@/components/ui/card.tsx", () => ({
  CardHeader: ({ children }: never) => <div>{children}</div>,
  CardDescription: ({ children }: never) => <div>{children}</div>,
  CardContent: ({ children }: never) => <div>{children}</div>,
}));
vi.mock("@/components/ui/badge.tsx", () => ({
  Badge: ({ children }: never) => <span>{children}</span>,
}));
vi.mock("@/components/ui/scroll-area.tsx", () => ({
  ScrollArea: ({ children }: never) => <div>{children}</div>,
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("<SidebarProjects />", () => {
  test("renders all projects", () => {
    const handleProject = vi.fn();

    render(
      <MemoryRouter>
        <SidebarProjects projects={[mockProject]} handleProject={handleProject} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search projects...")).toBeInTheDocument();

    expect(screen.getByText("Project: The Dark Streets")).toBeInTheDocument();
  });

  test("calls handleProject on card click", () => {
    const handleProject = vi.fn();

    render(
      <MemoryRouter>
        <SidebarProjects projects={[mockProject]} handleProject={handleProject} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Project: The Dark Streets"));
    expect(handleProject).toHaveBeenCalledWith(mockProject);
  });

  test("navigates to /template on button click", () => {
    const handleProject = vi.fn();

    render(
      <MemoryRouter>
        <SidebarProjects projects={[mockProject]} handleProject={handleProject} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Create a new project"));
    expect(mockNavigate).toHaveBeenCalledWith("/template");
  });
});

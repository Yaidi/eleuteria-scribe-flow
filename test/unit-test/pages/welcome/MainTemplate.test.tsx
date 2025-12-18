import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectType } from "@/types/project";
import { vi, expect, describe, test } from "vitest";
import { templates } from "../../../mocks/templates.ts";
import MainTemplate from "@/pages/welcome/MainTemplate.tsx";

describe("MainTemplate", () => {
  const mockHandleCreate = vi.fn();

  test("renders selected template content", () => {
    render(
      <MainTemplate
        templates={templates}
        selectedTemplate={ProjectType.novel}
        handleCreateProject={mockHandleCreate}
      />,
    );

    expect(screen.getByTestId("template-name")).toHaveTextContent(/Novel template/i);
    expect(
      screen.getByText("Perfect for long-form fiction with complex characters and world-building"),
    ).toBeInTheDocument();
    templates[0].sections.forEach((section) => {
      expect(screen.getByText(capitalize(section))).toBeInTheDocument();
    });
  });

  test("calls handleCreateProject when 'Choose This Template' is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MainTemplate
        templates={templates}
        selectedTemplate={ProjectType.novel}
        handleCreateProject={mockHandleCreate}
      />,
    );

    const button = screen.getByTestId("btn-create-project");
    await user.click(button);

    expect(mockHandleCreate).toHaveBeenCalledWith(ProjectType.novel);
  });

  test("renders custom template creation for NON_FICTION", () => {
    render(
      <MainTemplate
        templates={templates}
        selectedTemplate={ProjectType.non_fiction}
        handleCreateProject={mockHandleCreate}
      />,
    );

    expect(screen.getByText("Create Custom Template")).toBeInTheDocument();
    expect(screen.getByText("Create New Book")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter template name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your book title")).toBeInTheDocument();
  });

  test("calls handleCreateProject when 'Create Template' is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MainTemplate
        templates={templates}
        selectedTemplate={ProjectType.non_fiction}
        handleCreateProject={mockHandleCreate}
      />,
    );

    const createTemplateBtn = screen.getByRole("button", {
      name: /create template/i,
    });
    await user.click(createTemplateBtn);

    expect(mockHandleCreate).toHaveBeenCalledWith(ProjectType.non_fiction);
  });

  test("calls handleCreateProject when 'Create Book' is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MainTemplate
        templates={templates}
        selectedTemplate={ProjectType.non_fiction}
        handleCreateProject={mockHandleCreate}
      />,
    );

    const createBookBtn = screen.getByRole("button", {
      name: /create book/i,
    });
    await user.click(createBookBtn);

    expect(mockHandleCreate).toHaveBeenCalledWith(ProjectType.non_fiction);
  });
});

const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);

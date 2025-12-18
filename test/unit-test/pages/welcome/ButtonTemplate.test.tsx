import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ButtonTemplate from "@/pages/welcome/ButtonTemplate.tsx";
import {
  templateIllustraded,
  templateNovel,
  templatePoetry,
  templateThesis,
  templateTrilogy,
  templateNonFiction,
} from "../../../mocks/templates.ts";
import { ProjectType } from "@/types/project.ts";

const mockHandleTemplateSelect = vi.fn();

describe("ButtonTemplate", () => {
  test("renders and clicks Thesis", () => {
    render(
      <ButtonTemplate
        template={templateThesis}
        selectedTemplate={ProjectType.thesis}
        handleTemplateSelect={mockHandleTemplateSelect}
      />,
    );
    const button = screen.getByTestId("btn-thesis");
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(mockHandleTemplateSelect).toHaveBeenCalledWith(ProjectType.thesis);
    expect(button.className).toContain("border-purple-500");
  });

  test("renders and clicks Novel", () => {
    render(
      <ButtonTemplate
        template={templateNovel}
        selectedTemplate={ProjectType.novel}
        handleTemplateSelect={mockHandleTemplateSelect}
      />,
    );
    const button = screen.getByTestId("btn-novel");
    expect(button).toBeInTheDocument();
    expect(screen.getByText("novel")).toBeTruthy();
    fireEvent.click(button);
    expect(mockHandleTemplateSelect).toHaveBeenCalledWith(ProjectType.novel);
    expect(button.className).toContain("border-blue-500");
  });

  test("renders and clicks Poetry", () => {
    render(
      <ButtonTemplate
        template={templatePoetry}
        selectedTemplate={ProjectType.poetry}
        handleTemplateSelect={mockHandleTemplateSelect}
      />,
    );
    const button = screen.getByTestId("btn-poetry");
    expect(button).toBeInTheDocument();
    expect(screen.getByText("poetry")).toBeTruthy();
    fireEvent.click(button);
    expect(mockHandleTemplateSelect).toHaveBeenCalledWith(ProjectType.poetry);
    expect(button.className).toContain("border-pink-500");
  });

  test("renders and clicks Illustrated", () => {
    render(
      <ButtonTemplate
        template={templateIllustraded}
        selectedTemplate={ProjectType.illustrated}
        handleTemplateSelect={mockHandleTemplateSelect}
      />,
    );
    const button = screen.getByTestId("btn-illustrated");
    expect(button).toBeInTheDocument();
    expect(screen.getByText("illustrated")).toBeTruthy();
    fireEvent.click(button);
    expect(mockHandleTemplateSelect).toHaveBeenCalledWith(ProjectType.illustrated);
    expect(button.className).toContain("border-orange-500");
  });

  test("renders and clicks Trilogy", () => {
    render(
      <ButtonTemplate
        template={templateTrilogy}
        selectedTemplate={ProjectType.trilogy}
        handleTemplateSelect={mockHandleTemplateSelect}
      />,
    );
    const button = screen.getByTestId("btn-trilogy");
    expect(button).toBeInTheDocument();
    expect(screen.getByText("trilogy")).toBeTruthy();
    fireEvent.click(button);
    expect(mockHandleTemplateSelect).toHaveBeenCalledWith(ProjectType.trilogy);
    expect(button.className).toContain("border-indigo-500");
  });

  test("renders and clicks Non-fiction", () => {
    render(
      <ButtonTemplate
        template={templateNonFiction}
        selectedTemplate={ProjectType.non_fiction}
        handleTemplateSelect={mockHandleTemplateSelect}
      />,
    );
    const button = screen.getByTestId("btn-non-fiction");
    expect(button).toBeInTheDocument();
    expect(screen.getByText("non fiction")).toBeTruthy();
    fireEvent.click(button);
    expect(mockHandleTemplateSelect).toHaveBeenCalledWith(ProjectType.non_fiction);
    expect(button.className).toContain("border-teal-500");
  });
});

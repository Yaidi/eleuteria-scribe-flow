import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ButtonTemplate from "@/pages/welcome/ButtonTemplate.tsx";
import {
  templateIllustraded,
  templateNovel,
  templatePoetry,
  templateThesis,
} from "../../../mocks/templates.ts";
import { ProjectType } from "@/types/project.ts";

const mockHandleTemplateSelect = vi.fn();
describe("ButtonTemplate", () => {
  test("Thesis", () => {
    render(
      <ButtonTemplate
        template={templateThesis}
        selectedTemplate={ProjectType.thesis}
        handleTemplateSelect={mockHandleTemplateSelect}
      ></ButtonTemplate>,
    );
    const buttonThesis = screen.getByTestId("btn-thesis");
    expect(buttonThesis).toBeTruthy();
    buttonThesis.click();
  });

  test("Novel", () => {
    render(
      <ButtonTemplate
        template={templateNovel}
        selectedTemplate={ProjectType.novel}
        handleTemplateSelect={mockHandleTemplateSelect}
      ></ButtonTemplate>,
    );
    const buttonThesis = screen.getByTestId("btn-novel");
    expect(buttonThesis).toBeTruthy();
    buttonThesis.click();
  });
  test("Poetry", () => {
    render(
      <ButtonTemplate
        template={templatePoetry}
        selectedTemplate={ProjectType.poetry}
        handleTemplateSelect={mockHandleTemplateSelect}
      ></ButtonTemplate>,
    );
  });
  test("Illustrated", () => {
    render(
      <ButtonTemplate
        template={templateIllustraded}
        selectedTemplate={ProjectType.illustrated}
        handleTemplateSelect={mockHandleTemplateSelect}
      ></ButtonTemplate>,
    );
  });
});

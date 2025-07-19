import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProjectType } from "@/types/project";
import Templates, { TemplatesProps } from "@/pages/welcome/Templates.tsx";
import { templates } from "../../../mocks/templates.ts";

describe("Templates component", () => {
  it("should render all templates and header", () => {
    const props: TemplatesProps = {
      templates: templates,
      selectedTemplate: ProjectType.NOVEL,
      handleTemplateSelect: vi.fn(),
    };

    render(<Templates {...props} />);

    expect(screen.getByTestId("btn-novel")).toBeTruthy();
    expect(screen.getByTestId("btn-thesis")).toBeTruthy();
    expect(screen.queryByTestId("btn-poetry")).toBeNull();
  });

  it("should call handleTemplateSelect on click", async () => {
    const user = userEvent.setup();
    const mockHandler = vi.fn();

    const props: TemplatesProps = {
      templates: templates,
      selectedTemplate: ProjectType.NOVEL,
      handleTemplateSelect: mockHandler,
    };

    render(<Templates {...props} />);

    await user.click(screen.getByTestId("btn-thesis"));
    expect(mockHandler).toHaveBeenCalledWith(ProjectType.THESIS);

    await user.click(screen.getByTestId("btn-novel"));
    expect(mockHandler).toHaveBeenCalledWith(ProjectType.NOVEL);

    expect(mockHandler).toHaveBeenCalledTimes(2);
  });
});

import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import FormGeneralGoals from "@/components/forms/FormGeneralGoals.tsx";
import { mockProject } from "../../../mocks";

describe("FormGeneralGoals", () => {
  test("renders the form with correct structure", () => {
    render(<FormGeneralGoals project={mockProject} />);

    const form = screen.getByTestId("form-general-goals");
    expect(form).toBeInTheDocument();
    expect(form.tagName).toBe("FORM");
    expect(form).toHaveClass("flex", "flex-col", "gap-4", "items-start", "w-full", "h-full", "p-4");
  });

  test("displays the word goal label", () => {
    render(<FormGeneralGoals project={mockProject} />);

    expect(screen.getByText("Change word goal")).toBeInTheDocument();
  });

  test("renders the word goal input with correct value", () => {
    render(<FormGeneralGoals project={mockProject} />);

    const input = screen.getByDisplayValue("0");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("id", "wordGoal");
  });
});

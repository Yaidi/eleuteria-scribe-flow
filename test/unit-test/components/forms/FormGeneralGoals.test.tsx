import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import FormGeneralGoals from "@/components/forms/FormGeneralGoals.tsx";
import { mockProject } from "../../../mocks";

describe("FormGeneralGoals", () => {
  test("Initial", () => {
    render(<FormGeneralGoals project={mockProject} />);

    expect(screen.getByText("goals.changeWordGoal")).toBeInTheDocument();
  });
});

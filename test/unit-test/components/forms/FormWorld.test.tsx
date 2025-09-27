import { render, screen, fireEvent } from "@testing-library/react";
import { describe, vi, test, expect } from "vitest";
import { mockWorldElements } from "../../../mocks";
import FormWorld from "@/components/forms/FormWorld.tsx";

describe("FormWorld", () => {
  const mockUpdate = vi.fn();
  const mockRemove = vi.fn();

  test("renders component with name and description", () => {
    render(
      <FormWorld
        currentWorldElement={mockWorldElements[0]}
        update={mockUpdate}
        remove={mockRemove}
      />,
    );

    expect(screen.getByLabelText(/Name/i)).toHaveValue("The City");
    expect(screen.getByLabelText(/Description/i)).toHaveValue(
      "A sprawling metropolis filled with secrets and shadows.",
    );
  });

  test("updates name when input is change", () => {
    render(
      <FormWorld
        currentWorldElement={mockWorldElements[0]}
        update={mockUpdate}
        remove={mockRemove}
      />,
    );

    const input = screen.getByLabelText(/Name/i);
    fireEvent.change(input, { target: { value: "New name" } });

    expect(mockUpdate).toHaveBeenCalledWith({
      ...mockWorldElements[0],
      name: "New name",
    });
  });

  test("updates description when textarea is change", () => {
    render(
      <FormWorld
        currentWorldElement={mockWorldElements[0]}
        update={mockUpdate}
        remove={mockRemove}
      />,
    );

    const textarea = screen.getByLabelText(/Description/i);
    fireEvent.change(textarea, { target: { value: "New description" } });

    expect(mockUpdate).toHaveBeenCalledWith({
      ...mockWorldElements[0],
      description: "New description",
    });
  });

  test("calls remove when delete is clicked", () => {
    render(
      <FormWorld
        currentWorldElement={mockWorldElements[0]}
        update={mockUpdate}
        remove={mockRemove}
      />,
    );

    const button = screen.getByTestId(`btn-remove-world-el-${mockWorldElements[0].id}`);
    fireEvent.click(button);

    expect(mockRemove).toHaveBeenCalledWith(mockWorldElements[0].id);
  });
});

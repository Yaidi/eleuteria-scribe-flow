import { test, expect, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "@/pages/NotFound.tsx";
import { MemoryRouter } from "react-router-dom";

describe("NotFound", () => {
  test("should show log and redirect to main", () => {
    render(
      <MemoryRouter initialEntries={["/invalid-path"]}>
        <NotFound></NotFound>
      </MemoryRouter>,
    );

    screen.getByTestId("link-back").click();
    expect(window.location.pathname).toBe("/");
  });
});

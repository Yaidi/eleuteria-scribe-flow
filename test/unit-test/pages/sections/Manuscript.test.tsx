import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import Manuscript from "@/pages/sections/Manuscript.tsx";
import { screen } from "@testing-library/react";
import { ESections } from "@/types/sections.ts";

describe("<Manuscript />", () => {
  test("renders component", () => {
    render(<Manuscript section={ESections.manuscript}></Manuscript>);
    expect(screen.getByText("manuscript")).toBeTruthy();
  });
});

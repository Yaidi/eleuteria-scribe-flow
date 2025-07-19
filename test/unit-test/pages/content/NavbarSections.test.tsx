import { screen, fireEvent } from "@testing-library/react";
import { setCurrentSection } from "@/store";
import { ESections } from "@/types/sections";
import { vi, expect, test, describe } from "vitest";
import NavbarSections from "@/pages/content/NavbarSections.tsx";
import { renderWithProviders } from "../../../utils/renderWithProviders.tsx";

const mockDispatch = vi.fn();
vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

describe("NavbarSections", () => {
  test("renders all section buttons", () => {
    renderWithProviders(<NavbarSections />);

    expect(screen.getByText("general")).toBeInTheDocument();
    expect(screen.getByText("characters")).toBeInTheDocument();
    expect(screen.getByText("plots")).toBeInTheDocument();
  });

  test("highlights current section button", () => {
    renderWithProviders(<NavbarSections />);

    const generalBtn = screen.getByText("general");
    expect(generalBtn.parentElement).toHaveClass("bg-blue-100");
  });

  test("dispatches setCurrentSection on button click", () => {
    renderWithProviders(<NavbarSections />);

    const charactersBtn = screen.getByText("characters");
    fireEvent.click(charactersBtn);

    expect(mockDispatch).toHaveBeenCalledWith(setCurrentSection(ESections.characters));
  });
});

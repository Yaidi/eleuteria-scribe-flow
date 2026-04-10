import { vi, describe, test, expect } from "vitest";
import { screen } from "@testing-library/react";
import { ESections, GeneralSections } from "@/types/sections.ts";

vi.mock("@/components/forms/FormGeneralBook.tsx", () => ({
  default: () => <div>Mocked FormGeneralBook</div>,
}));
vi.mock("@/components/forms/FormGeneralGoals.tsx", () => ({
  default: () => <div>Mocked FormGeneralGoals</div>,
}));

// Imports that execute code after mocks
import General from "@/pages/sections/General.tsx";
import { renderWithProviders } from "../../../utils/renderWithProviders.tsx";
import { mockProjectData } from "../../../mocks";
import { store } from "@/store/config.ts";

describe("General section", () => {
  test("renders book info section when currentGeneralSection is bookInfo", () => {
    renderWithProviders(<General />, {
      project: {
        currentProject: mockProjectData,
        currentSection: ESections.general,
        sections: {
          ...store.getState().project?.sections,
          general: {
            currentGeneralSection: GeneralSections.bookInfo,
            general: mockProjectData.sections.general,
          },
        },
      },
    });

    expect(screen.getByText("Mocked FormGeneralBook")).toBeInTheDocument();
    expect(screen.getByText("Mocked FormGeneralBook")).toBeTruthy();
  });

  test("renders goals section when currentGeneralSection is goals", () => {
    renderWithProviders(<General />, {
      project: {
        currentProject: mockProjectData,
        currentSection: ESections.general,
        sections: {
          ...store.getState().project?.sections,
          general: {
            currentGeneralSection: GeneralSections.goals,
            general: mockProjectData.sections.general,
          },
        },
      },
    });

    expect(screen.getByText("Mocked FormGeneralGoals")).toBeInTheDocument();
  });

  test("renders stastics section when currentGeneralSection is stastics", () => {
    renderWithProviders(<General />, {
      project: {
        currentProject: mockProjectData,
        currentSection: ESections.general,
        sections: {
          ...store.getState().project?.sections,
          general: {
            currentGeneralSection: GeneralSections.statistics,
            general: mockProjectData.sections.general,
          },
        },
      },
    });
  });
});

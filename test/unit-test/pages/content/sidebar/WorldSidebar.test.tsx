import { render, screen, fireEvent } from "@testing-library/react";
import { useSections } from "@/hooks/useSections";
import { vi, describe, test, expect, beforeEach, Mock } from "vitest";
import { mockWorld, mockWorldElements } from "../../../../mocks";
import { IWorldElementsObject } from "@/types/sections.ts";
import WorldSidebar from "@/pages/content/sidebar/WorldSidebar.tsx";
import { updateWorldElement } from "@/store";

const mockDispatch = vi.fn();
vi.mock("react-redux", async () => {
  const actual = await vi.importActual<typeof import("react-redux")>("react-redux");
  return {
    ...actual,
    useDispatch: vi.fn(() => mockDispatch),
  };
});

vi.mock("@/store", () => ({
  updateWorldElement: vi.fn((el) => ({ type: "updateWorldElement", payload: el })),
  setCurrentWorldElement: vi.fn((el) => ({ type: "setCurrentWorldElement", payload: el })),
}));

vi.mock("@/hooks/useSections", () => ({
  useSections: vi.fn(),
}));

describe("WorldSidebar", () => {
  const mockObjectElements: IWorldElementsObject = {
    1: {
      ...mockWorldElements[0],
      childrenIds: [2],
    },
    2: {
      ...mockWorldElements[1],
      parentId: 1,
      childrenIds: [],
    },
  };
  beforeEach(() => {
    vi.clearAllMocks();
    (useSections as Mock).mockReturnValue({
      world: { world: mockWorld, worldElements: mockObjectElements },
    });
  });

  test("renders sidebar title", () => {
    render(<WorldSidebar />);
    expect(screen.getByText("World Building")).toBeInTheDocument();
  });

  test("renders root world elements", () => {
    render(<WorldSidebar />);
    expect(screen.getByTestId("node-1")).toBeInTheDocument();
    expect(screen.queryByTestId("node-2")).toBeInTheDocument();
  });

  test("highlights root drop area on drag enter", () => {
    render(<WorldSidebar />);
    const dropArea = screen.getByText("World Building").parentElement?.nextSibling as HTMLElement;
    fireEvent.dragEnter(dropArea, { preventDefault: () => {} });
    expect(dropArea.className).toContain("bg-green-100");
  });

  test("dispatches updateWorldElement on drop", () => {
    render(<WorldSidebar />);

    const dropArea = screen.getByText("World Building").parentElement?.nextSibling as HTMLElement;

    const dataTransfer = {
      getData: vi.fn().mockReturnValue("2"),
      setData: vi.fn(),
    };

    fireEvent.drop(dropArea, {
      preventDefault: vi.fn(),
      dataTransfer,
    });

    expect(mockDispatch).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      updateWorldElement({
        ...mockWorldElements[1],
        parentId: null,
      }),
    );
  });
});

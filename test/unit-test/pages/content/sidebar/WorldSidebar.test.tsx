import { render, screen, fireEvent } from "@testing-library/react";
import { useSections } from "@/hooks/useSections";
import { vi, describe, test, expect, beforeEach, Mock } from "vitest";
import { mockWorld, mockWorldElements } from "../../../../mocks";
import { IWorldElementsObject } from "@/types/sections.ts";
import WorldSidebar from "@/pages/content/sidebar/WorldSidebar.tsx";

const mockDispatch = vi.fn();
vi.mock("react-redux", async () => {
  const actual = await vi.importActual<typeof import("react-redux")>("react-redux");
  return {
    ...actual,
    useDispatch: vi.fn(() => mockDispatch),
  };
});

vi.mock("@/store", async () => {
  const actual = await vi.importActual<typeof import("@/store")>("@/store");
  return {
    ...actual,
    updateWorldElement: vi.fn((el) => ({ type: "updateWorldElement", payload: el })),
    setCurrentWorldElement: vi.fn((el) => ({ type: "setCurrentWorldElement", payload: el })),
    addWorldElement: vi.fn((el) => ({ type: "addWorldElement", payload: el })),
  };
});

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
    const dropArea = screen.getByTestId("ouside-element");
    fireEvent.dragEnter(dropArea, { bubbles: true });
    expect(dropArea.className).toContain("bg-blue-100");
  });

  test("dispatches updateWorldElement on drop", () => {
    render(<WorldSidebar />);
    const dropArea = screen.getByTestId("ouside-element");

    // Use real DataTransfer when available (JSDOM), otherwise fallback to a mock object
    const dataTransfer: DataTransfer =
      typeof DataTransfer !== "undefined"
        ? new DataTransfer()
        : ({ getData: vi.fn().mockReturnValue("2"), setData: vi.fn() } as unknown as DataTransfer);
    if (typeof dataTransfer.setData === "function") dataTransfer.setData("text/plain", "2");

    // Create a native Drop event and attach the dataTransfer
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "dataTransfer", { value: dataTransfer });
    fireEvent(dropArea, dropEvent as unknown as Event);

    expect(mockDispatch).toHaveBeenCalled();
    // The mocked updateWorldElement returns an action with type and payload
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "updateWorldElement",
        payload: {
          ...mockWorldElements[1],
          parentId: null,
        },
      }),
    );
  });

  test("add worldElement", () => {
    render(<WorldSidebar />);
    screen.getByTestId("btn-add-world-element").click();
    expect(mockDispatch).toHaveBeenCalled();
  });
});

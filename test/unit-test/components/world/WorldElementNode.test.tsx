import { render, screen, fireEvent } from "@testing-library/react";
import WorldElementNode from "@/components/world/WorldElementNode";
import { setCurrentWorldElement } from "@/store";
import { vi, test, expect, describe, beforeEach } from "vitest";

describe("WorldElementNode", () => {
  const baseElement = {
    id: 1,
    name: "Root Node",
    parentId: null,
    childrenIds: [],
    description: "",
    origin: "",
    conflictCause: "",
    worldId: 1,
  };

  const childElement = {
    ...baseElement,
    id: 2,
    name: "Child Node",
    parentId: 1,
    childrenIds: [],
  };

  const mockDispatch = vi.fn();
  const mockHandleDragStart = vi.fn();
  const mockHandleDrop = vi.fn();
  const mockHandleEnter = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders element name", () => {
    render(
      <WorldElementNode
        worldElements={{ 1: baseElement }}
        element={baseElement}
        depth={0}
        handleDragStart={mockHandleDragStart}
        handleDrop={mockHandleDrop}
        handleEnter={mockHandleEnter}
        dispatch={mockDispatch}
        isDraggingOver={true}
      />,
    );

    expect(screen.getByText("Root Node")).toBeInTheDocument();
  });

  test("dispatches setCurrentWorldElement on click", () => {
    render(
      <WorldElementNode
        worldElements={{ 1: baseElement }}
        element={baseElement}
        depth={0}
        handleDragStart={mockHandleDragStart}
        handleDrop={mockHandleDrop}
        handleEnter={mockHandleEnter}
        dispatch={mockDispatch}
      />,
    );

    fireEvent.click(screen.getByText("Root Node"));
    expect(mockDispatch).toHaveBeenCalledWith(setCurrentWorldElement(baseElement));
  });

  test("calls handleDragStart on dragStart", () => {
    render(
      <WorldElementNode
        worldElements={{ 1: baseElement }}
        element={baseElement}
        depth={0}
        handleDragStart={mockHandleDragStart}
        handleDrop={mockHandleDrop}
        handleEnter={mockHandleEnter}
        dispatch={mockDispatch}
      />,
    );

    const btn = screen.getByText("Root Node");
    fireEvent.dragStart(btn, { dataTransfer: { setData: vi.fn() } });

    expect(mockHandleDragStart).toHaveBeenCalledWith(expect.any(Object), 1, expect.any(Function));
  });

  test("resets selectedElement on dragEnd", () => {
    render(
      <WorldElementNode
        worldElements={{ 1: baseElement }}
        element={baseElement}
        depth={0}
        handleDragStart={mockHandleDragStart}
        handleDrop={mockHandleDrop}
        handleEnter={mockHandleEnter}
        dispatch={mockDispatch}
      />,
    );

    const btn = screen.getByText("Root Node");
    fireEvent.dragStart(btn, { dataTransfer: { setData: vi.fn() } });
    fireEvent.dragEnd(btn);

    expect(btn.className).toContain("disabled:opacity-50");
  });

  test("calls handleEnter on dragEnter", () => {
    render(
      <WorldElementNode
        worldElements={{ 1: baseElement }}
        element={baseElement}
        depth={0}
        handleDragStart={mockHandleDragStart}
        handleDrop={mockHandleDrop}
        handleEnter={mockHandleEnter}
        dispatch={mockDispatch}
      />,
    );

    const btn = screen.getByText("Root Node");
    fireEvent.dragEnter(btn, { preventDefault: () => {} });

    expect(mockHandleEnter).toHaveBeenCalledWith(1);
  });

  test("calls handleDrop if depth < 2", () => {
    render(
      <WorldElementNode
        worldElements={{ 1: baseElement }}
        element={baseElement}
        depth={1}
        handleDragStart={mockHandleDragStart}
        handleDrop={mockHandleDrop}
        handleEnter={mockHandleEnter}
        dispatch={mockDispatch}
      />,
    );

    const btn = screen.getByText("Root Node");
    fireEvent.drop(btn, { preventDefault: () => {} });

    expect(mockHandleDrop).toHaveBeenCalledWith(expect.any(Object), 1);
  });

  test("does not call handleDrop if depth >= 2", () => {
    render(
      <WorldElementNode
        worldElements={{ 1: baseElement }}
        element={baseElement}
        depth={2}
        handleDragStart={mockHandleDragStart}
        handleDrop={mockHandleDrop}
        handleEnter={mockHandleEnter}
        dispatch={mockDispatch}
      />,
    );

    const btn = screen.getByText("Root Node");
    fireEvent.drop(btn, { preventDefault: () => {} });

    expect(mockHandleDrop).not.toHaveBeenCalled();
  });

  test("renders children recursively", () => {
    render(
      <WorldElementNode
        worldElements={{ 1: { ...baseElement, childrenIds: [2] }, 2: childElement }}
        element={{ ...baseElement, childrenIds: [2] }}
        depth={0}
        handleDragStart={mockHandleDragStart}
        handleDrop={mockHandleDrop}
        handleEnter={mockHandleEnter}
        dispatch={mockDispatch}
      />,
    );

    expect(screen.getByText("Child Node")).toBeInTheDocument();
  });

  test("applies dragging over styles when isDraggingOver is true", () => {
    render(
      <WorldElementNode
        worldElements={{ 1: baseElement }}
        element={baseElement}
        depth={0}
        handleDragStart={mockHandleDragStart}
        handleDrop={mockHandleDrop}
        handleEnter={mockHandleEnter}
        dispatch={mockDispatch}
        isDraggingOver={true}
      />,
    );

    const btn = screen.getByText("Root Node");
    expect(btn.className).toContain("bg-blue-100");
  });
});

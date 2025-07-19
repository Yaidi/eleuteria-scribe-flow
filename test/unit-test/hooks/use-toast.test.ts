import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { useToast, toast } from "@/hooks/use-toast";

// Simulate the delay system
vi.useFakeTimers();

describe("useToast", () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("creates a new toast and reflects in state", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: "Hello", description: "World" });
    });

    const toasts = result.current.toasts;
    expect(toasts.length).toBe(1);
    expect(toasts[0].title).toBe("Hello");
    expect(toasts[0].description).toBe("World");
    expect(toasts[0].open).toBe(true);
  });

  test("dismisses a toast and sets open=false", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      const { id } = toast({ title: "Dismiss Me" });
      result.current.dismiss(id);
    });

    const toasts = result.current.toasts;
    expect(toasts.length).toBe(1);
    expect(toasts[0].open).toBe(false);
  });

  test("removes toast after delay", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast());

    let toastId = "";

    act(() => {
      const t = toast({ title: "To Remove" });
      toastId = t.id;
      result.current.dismiss(toastId);
    });

    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].open).toBe(false);

    // Fast-forward timers to simulate removal delay
    act(() => {
      vi.advanceTimersByTime(1000000);
    });

    expect(result.current.toasts.length).toBe(0);
  });

  test("dismisses all toasts when no id is passed", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: "One" });
      toast({ title: "Two" });
      result.current.dismiss(); // dismiss all
    });

    expect(result.current.toasts.length).toBe(1); // TOAST_LIMIT = 1
    expect(result.current.toasts[0].open).toBe(false);
  });

  test("updates an existing toast", () => {
    const { result } = renderHook(() => useToast());

    let updateFn: ReturnType<typeof toast>["update"];
    act(() => {
      const t = toast({ title: "Initial" });
      updateFn = t.update;
    });

    act(() => {
      updateFn({ title: "Updated", id: "1" });
    });

    const toasts = result.current.toasts;
    expect(toasts[0].title).toBe("Updated");
  });

  test("toast is limited by TOAST_LIMIT", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: "Toast 1" });
      toast({ title: "Toast 2" });
    });

    expect(result.current.toasts.length).toBe(1); // only one allowed
    expect(result.current.toasts[0].title).toBe("Toast 2"); // newer replaces older
  });
});

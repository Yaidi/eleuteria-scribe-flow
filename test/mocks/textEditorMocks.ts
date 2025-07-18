import { vi } from "vitest";
import { CanCommands, Editor } from "@tiptap/react";

interface IsActiveOptions {
  level?: number;
}

type IsActiveSignature = (format?: string | object, options?: IsActiveOptions) => boolean;

export const mockIsActive = vi.fn<IsActiveSignature>(() => false);

const mockChain = {
  chain: vi.fn(() => mockChain),
  focus: vi.fn(() => mockChain),
  toggleBold: vi.fn(() => mockChain),
  toggleItalic: vi.fn(() => mockChain),
  toggleStrike: vi.fn(() => mockChain),
  toggleCode: vi.fn(() => mockChain),
  toggleHeading: vi.fn(() => mockChain),
  toggleBulletList: vi.fn(() => mockChain),
  toggleOrderedList: vi.fn(() => mockChain),
  undo: vi.fn(() => mockChain),
  redo: vi.fn(() => mockChain),
  run: vi.fn(() => true),
};

const mockCanCommands = {
  chain: vi.fn(() => mockChain),
  undo: vi.fn(() => mockCanCommands),
  redo: vi.fn(() => mockCanCommands),
  toggleBold: vi.fn(() => mockCanCommands),
  toggleItalic: vi.fn(() => mockCanCommands),
  toggleStrike: vi.fn(() => mockCanCommands),
  toggleCode: vi.fn(() => mockCanCommands),
  toggleHeading: vi.fn(() => mockCanCommands),
  toggleBulletList: vi.fn(() => mockCanCommands),
  toggleOrderedList: vi.fn(() => mockCanCommands),
  run: vi.fn(() => true),
} as unknown as CanCommands;

export const mockEditor = {
  chain: vi.fn(() => mockChain),
  can: vi.fn(() => mockCanCommands),
  isActive: mockIsActive,
  on: vi.fn(),
  off: vi.fn(),
} as unknown as Editor;

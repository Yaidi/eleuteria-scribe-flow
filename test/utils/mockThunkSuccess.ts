import { PayloadAction } from "@reduxjs/toolkit";
import { vi } from "vitest";

export function mockThunkSuccess<Payload = never>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  module: Record<string, any>,
  thunkKey: keyof typeof module,
  payload: Payload,
) {
  const thunk = module[thunkKey];

  vi.spyOn(module, thunkKey).mockImplementation(() => {
    return async () => {
      const fulfilledType = thunk.fulfilled.type;
      const action: PayloadAction<Payload, string, unknown, unknown> = {
        type: fulfilledType,
        payload,
        meta: {
          arg: undefined,
          requestId: "mock-request-id",
          requestStatus: "fulfilled",
        },
        error: undefined,
      };

      return action;
    };
  });
}

/* eslint-disable */
import { vi } from "vitest";

export function mockThunkSuccess<Payload = never>(
  module: Record<string, any>,
  thunkKey: keyof typeof module,
  payload: Payload,
) {
  vi.spyOn(module, thunkKey).mockImplementation(() => {
    const thunkFn = () =>
      Object.assign(Promise.resolve(payload), {
        unwrap: () => Promise.resolve(payload),
      });

    return thunkFn;
  });
}

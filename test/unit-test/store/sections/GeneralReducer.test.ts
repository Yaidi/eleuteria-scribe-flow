import { describe, expect, test } from "vitest";
import { GenreType, IGeneral } from "@/types/sections.ts";
import { generalReducer } from "@/store/sections/general/reducer.ts";
import { UnknownAction } from "@reduxjs/toolkit";
import { updateGeneral } from "@/store";

describe("GeneralReducer", () => {
  const initialState: IGeneral = {
    title: "",
    author: "",
    subtitle: "",
    series: "",
    volume: 0,
    genre: GenreType.Romance,
    license: "",
    situation: "",
    resumePhrase: "",
    resumeParagraph: "",
    resumePage: "",
  };

  test("should handle initial state with unknown action", () => {
    const action = { type: "unknown" };
    const result = generalReducer(initialState, action);
    expect(result).toEqual(initialState);
  });
  test("should handle update general", () => {
    const action: UnknownAction = {
      type: updateGeneral.fulfilled.type,
      payload: {
        title: "Updated Title",
      },
    };
    const result = generalReducer(initialState, action);
    expect(result).toEqual({
      ...initialState,
      title: "Updated Title",
    });
  });
});

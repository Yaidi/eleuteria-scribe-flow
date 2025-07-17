import { useSelector } from "react-redux";
import { RootState } from "@/store/config.ts";
import { ISectionsReducer } from "@/store/sections/sections-config.ts";

export const useSections = (): ISectionsReducer => {
  return useSelector((state: RootState) => state.sections);
};

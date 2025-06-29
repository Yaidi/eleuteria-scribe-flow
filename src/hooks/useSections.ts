import { useSelector } from "react-redux";
import { ISectionsReducer } from "@/store/sections/reducer";
import { RootState } from "@/store/config.tsx";

export const useSections = (): ISectionsReducer => {
  return useSelector((state: RootState) => state.sections);
};

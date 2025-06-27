import {createAction} from "@reduxjs/toolkit";
import {IChapter, ICharacter, IGeneral, IPlot, IWorld} from "@/types/sections.tsx";
import {ISectionsReducer} from "@/store/sections/reducer.ts";

export const addCharacter = createAction<ICharacter>('[Character] Add Product to cart');

export const getCharacters = createAction('[Character] Get Characters');

export const updateInfoCharacter = createAction<Partial<ICharacter>>('[Character] Add Product to cart success');

export const removeCharacter = createAction<string>('[Character] Remove Product to cart');

export const addWorld = createAction<IWorld>('[World] Add Product to cart');

export const updateInfoWorld = createAction<Partial<IWorld>>('[World] Add Product to cart success');

export const removeWorld = createAction<string>('[World] Remove Product to cart');

export const updateGeneral = createAction<Partial<IGeneral>>('[General] Add Product to cart success');

export const addChapter = createAction<IChapter>('[Chapter] Add Product to cart');

export const updateChapter = createAction<IChapter>('[Chapter] Add Product to cart success');

export const removeChapter = createAction<string>('[Chapter] Remove Product to cart');

export const getSections = createAction<ISectionsReducer>('[Chapter] Add Product to cart success');

export const addPlot = createAction<IPlot>('[Plot] Add Product to cart');

export const updatePlot = createAction<Partial<IPlot>>('[Plot] Add Product to cart success');

export const removePlot = createAction<string>('[Plot] Remove Product to cart');
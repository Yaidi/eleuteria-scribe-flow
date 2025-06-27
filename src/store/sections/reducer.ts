import {createReducer} from "@reduxjs/toolkit";
import {
    addChapter,
    addCharacter,
    addWorld, getSections,
    removeChapter,
    removeCharacter,
    removeWorld, updateGeneral, updateInfoCharacter
} from "@/store/sections/action.ts";
import {IChapter, ICharacter, IGeneral, IPlot, IWorld} from "@/types/sections.ts";

export interface ISectionsReducer {
    general: IGeneral,
    characters: ICharacter[],
    plots: IPlot[],
    world: IWorld[],
    manuscript: IChapter[]
}

const initialState: ISectionsReducer  = {
    general: {
        title: "Titulo",
        author: "",
        subtitle: "",
        series: "",
        volume: "",
        genre: "",
        license: ""
    },
    characters: [],
    plots: [],
    world: [],
    manuscript: []
}

export const SectionsReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(getSections, (state, {payload}) => {
            return ({
                ...state,
                ...payload
            });
        })
        .addCase(addChapter, (state,{payload}) => {
            return ({
                ...state,
                manuscript: [...state.manuscript, payload]
            });
        })
        .addCase(removeChapter,(state, {payload}) => {
            return ({
                ...state,
                manuscript: state.manuscript.filter(chapter => chapter.id !== payload)
            });
        })
        .addCase(addCharacter, (state, {payload}) => {
            return ({
                ...state,
                characters: [...state.characters, payload]
            });
        })
        .addCase(removeCharacter, (state, {payload}) => {
            return ({
                ...state,
                characters: state.characters.filter(character => character.id !== payload)
            });
        })
        .addCase(updateInfoCharacter, (state, {payload}) => {
            return ({
                ...state,
                characters: state.characters.map(character => character.id === payload.id ? {...character, ...payload} : character)
            });
        })
        .addCase(removeWorld, (state, {payload}) => {
            return ({
                ...state,
                world: state.world.filter(world => world.id !== payload)
            });
        })
        .addCase(addWorld, (state, {payload}) => {
            return ({
                ...state,
                world: [...state.world, payload]
            });
        })
        .addCase(updateGeneral, (state, {payload}) =>{
            return ({
                ...state,
                general: {...state.general, ...payload}
            })
    })
});
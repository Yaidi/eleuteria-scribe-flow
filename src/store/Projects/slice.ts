import {createAsyncThunk} from "@reduxjs/toolkit";
import {getProjects} from "@/store/Projects/actions.ts";
import {ProjectData} from "@/types/project.tsx";
import {mockProjectData} from "@/test/mocks";

/*export const projectsFetch = createAsyncThunk<ProjectData[]>(
    getProjects.type,
    async () => {
        const response = await fetch('http://localhost:8080')
        if (!response.ok) {
            throw new Error('Error fetching projects')
        }
        const data: ProjectData[] = await response.json()
        return data
    }
)*/

export const projectsFetch = createAsyncThunk<ProjectData[]>(
    getProjects.type, // Puedes usar un string como 'projects/fetchAll' también
    async () => {
        const response: ProjectData[] = await new Promise((resolve) => {
            setTimeout(() => {
                resolve([mockProjectData])
            }, 500) // 500 ms de delay simulado
        })
        return response
    }
)
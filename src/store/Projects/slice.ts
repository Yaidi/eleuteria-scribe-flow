import {createAsyncThunk} from "@reduxjs/toolkit";
import {addProject, getProjects} from "@/store/Projects/actions.ts";
import {ProjectData} from "@/types/project.tsx";
import {getCurrentProject} from "@/store/project/actions.ts";
import {RequestAddProject} from "@/types/requestAddProject.ts";

export const projectsFetch = createAsyncThunk<ProjectData[]>(
    getProjects.type,
    async () => {
        const response = await fetch('/api/getProjectList?id=1')
        if (!response.ok) {
            throw new Error('Error fetching projects')
        }
        const data: ProjectData[] = await response.json()
        return data
    }
)

export const getProjectFetch = createAsyncThunk<ProjectData[], string>(
    getCurrentProject.type,
    async (id: string) => {
        const response = await fetch(`/api/getProject?id=${id}`)
        if (!response.ok) {
            throw new Error('Error fetching projects')
        }
        const data: ProjectData[] = await response.json()
        return data
    }
)

export const addProjectFetch = createAsyncThunk<ProjectData, RequestAddProject>(
    addProject.type,
    async (body: RequestAddProject) => {
        const response = await fetch(`/api/addProject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
        if (!response.ok) {
            throw new Error('Error fetching projects')
        }
        const data: ProjectData = await response.json()
        return data
    }
)
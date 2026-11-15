import api from './api';

import type {
    Task,
    CreateTaskInput,
    UpdateTaskInput,
    TaskListResponse,
    TaskFilters
} from '../types/task';



export const getProjectTasks = async (
    projectId: string,
    filters: TaskFilters = {}
): Promise<TaskListResponse> => {
    const response = await api.get(
        `/projects/${projectId}/tasks`,
        { params: filters }
    );

    return {
        tasks: response.data.data,
        pagination: response.data.pagination
    };
};

export const createTask = async (
    projectId: string,
    data: CreateTaskInput
): Promise<Task> => {
    const response = await api.post(
        `/projects/${projectId}/tasks`,
        data
    );

    return response.data.data;
};

export const updateTask = async (
    projectId: string,
    taskId: string,
    data: UpdateTaskInput
): Promise<Task> => {
    const response = await api.patch(
        `/projects/${projectId}/tasks/${taskId}`,
        data
    );

    return response.data.data;
};

export const deleteTask = async (
    projectId: string,
    taskId: string
): Promise<void> => {
    await api.delete(
        `/projects/${projectId}/tasks/${taskId}`
    );
};
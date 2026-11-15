import api from './api';

import type {
    ProjectMember,
    ProjectRole
} from '../types/projectMember';

export const getProjectMembers = async (
    projectId: string
): Promise<ProjectMember[]> => {
    const response = await api.get(
        `/projects/${projectId}/members`
    );

    return response.data.data;
};

export const addProjectMember = async (
    projectId: string,
    email: string
): Promise<ProjectMember> => {
    const response = await api.post(
        `/projects/${projectId}/members`,
        { email }
    );

    return response.data.data;
};

export const updateMemberRole = async (
    projectId: string,
    memberId: string,
    role: ProjectRole
): Promise<ProjectMember> => {
    const response = await api.patch(
        `/projects/${projectId}/members/${memberId}/role`,
        { role }
    );

    return response.data.data;
};

export const removeProjectMember = async (
    projectId: string,
    memberId: string
): Promise<void> => {
    await api.delete(
        `/projects/${projectId}/members/${memberId}`
    );
};
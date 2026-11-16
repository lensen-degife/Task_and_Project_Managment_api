import api from './api';

export interface TaskComment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

export const getTaskComments = async (
  projectId: string,
  taskId: string
): Promise<TaskComment[]> => {
  const response = await api.get(
    `/projects/${projectId}/tasks/${taskId}/comments`
  );

  return response.data.data;
};

export const createTaskComment = async (
  projectId: string,
  taskId: string,
  content: string
): Promise<TaskComment> => {
  const response = await api.post(
    `/projects/${projectId}/tasks/${taskId}/comments`,
    { content }
  );

  return response.data.data;
};

export const updateTaskComment = async (
  projectId: string,
  taskId: string,
  commentId: string,
  content: string
): Promise<TaskComment> => {
  const response = await api.patch(
    `/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
    { content }
  );

  return response.data.data;
};

export const deleteTaskComment = async (
  projectId: string,
  taskId: string,
  commentId: string
): Promise<void> => {
  await api.delete(
    `/projects/${projectId}/tasks/${taskId}/comments/${commentId}`
  );
};
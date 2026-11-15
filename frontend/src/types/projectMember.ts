export type ProjectRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: ProjectRole;
  joinedAt: string;

  user: {
    id: string;
    name: string;
    email: string;
  };
}
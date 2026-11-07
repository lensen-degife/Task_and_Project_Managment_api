import { prisma } from "./config/prisma";
import helmet from 'helmet'
import express from "express";
import cors from "cors";
import authRoutes from './modules/auth/auth.routes'
import projectRoutes from './modules/projects/projects.routes'
import taskRoutes from './modules/tasks/task.routes'
import commentRoutes from './modules/comments/comment.routes'
import memberRoutes from './modules/members/members.routes'
import {errorHandler} from './middleware/error.middleware'
import {notFound} from './middleware/notFound.middleware'

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Project Management API is running",
  });
});

app.get("/health/db", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "Database connection successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/projects/:projectId/tasks/:taskId/comments', commentRoutes);
app.use('/api/projects/:projectId', memberRoutes);

app.use(notFound);

app.use(errorHandler);

export default app;
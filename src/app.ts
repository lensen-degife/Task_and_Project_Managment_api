import { prisma } from "./config/prisma";
import helmet from 'helmet'
import express from "express";
import cors from "cors";
import authRoutes from './modules/auth/auth.routes'
import projectRoutes from './modules/projects/projects.routes'
import taskRoutes from './modules/tasks/task.routes'
import commentRoutes from './modules/comments/comment.routes'
import memberRoutes from './modules/members/members.routes'
import { errorHandler } from './middleware/error.middleware'
import { notFound } from './middleware/notFound.middleware'
import { authLimiter } from './middleware/rate-limit.middleware';
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Project Management API is running",
  });
});

app.get("/health/db", async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "Database connection successful",
    });
  } catch (error) {
    next(error);
  }
});

app.get('/projects', async (req, res, next) => {
  try {
    const data= await prisma.project.findMany({});

    return res.json(data);

  }
  catch (e) {
    next(e);
  }
})

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/projects/:projectId/tasks/:taskId/comments', commentRoutes);
app.use('/api/projects/:projectId', memberRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFound);

app.use(errorHandler);

export default app;
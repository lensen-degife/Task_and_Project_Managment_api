import {Router} from 'express'
import {
    createProjectController, listProjectsController, getProjectByIdController,
    updateProjectController, deleteProjectController
} from './projects.controller'
import { authenticate } from '../../middleware/auth.middleware'
import { validate } from "../../middleware/validate.middleware";
import { createProjectSchema, updateProjectSchema } from "./projects.validation";


const router = Router();

router.use(authenticate);
router.post('/', validate(createProjectSchema), createProjectController);
router.get('/', listProjectsController);
router.get('/:projectId', getProjectByIdController);
router.patch('/:projectId', validate(updateProjectSchema), updateProjectController);
router.delete('/:projectId', deleteProjectController);

export default router;
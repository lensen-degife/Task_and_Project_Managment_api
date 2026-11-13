import { Router } from 'express'
import {
    createProjectController, listProjectsController, getProjectByIdController,
    updateProjectController, deleteProjectController, transferOwnershipController
} from './projects.controller'
import { authenticate } from '../../middleware/auth.middleware'
import { validate } from "../../middleware/validate.middleware";
import { createProjectSchema, updateProjectSchema, transferOwnershipSchema } from "./projects.validation";
import { getProjectAuditLogsController } from '../audit_logs/audit-log.controller'
import { IdempotencyService } from '../../middleware/IdempotencyService'


const router = Router();

router.use(authenticate);
router.post('/', validate(createProjectSchema), IdempotencyService, createProjectController);
router.get('/', listProjectsController);
router.get('/:projectId', getProjectByIdController);
router.patch('/:projectId', validate(updateProjectSchema), updateProjectController);
router.delete('/:projectId', deleteProjectController);
router.patch('/:projectId/transfer-ownership', validate(transferOwnershipSchema), transferOwnershipController);
router.get(
    "/:projectId/audit-logs",
    authenticate,
    getProjectAuditLogsController
);

export default router;
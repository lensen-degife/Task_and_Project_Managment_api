import Router from 'express'
import {createProjectController, listProjectsController, getProjectByIdController,
    updateProjectController
} from './projects.controller'
import {authenticate} from '../../middleware/auth.middleware'


const router = Router();

router.use(authenticate);
router.post('/', createProjectController);
router.get('/', listProjectsController);
router.get('/:projectId', getProjectByIdController );
router.post('/:projectId', updateProjectController);
export default router;
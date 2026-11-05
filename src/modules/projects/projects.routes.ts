import Router from 'express'
import {createProjectController, listProjectsController, getProjectByIdController} from './projects.controller'
import {authenticate} from '../../middleware/auth.middleware'


const router = Router();

router.use(authenticate);
router.post('/', createProjectController);
router.get('/', listProjectsController);
router.get('/:projectId', getProjectByIdController );
export default router;
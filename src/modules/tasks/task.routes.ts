import {Router} from "express"
import {createTaskController, getTasksController} from './task.controller';
import {authenticate} from '../../middleware/auth.middleware'

const router = Router({ mergeParams: true });

router.use(authenticate)
router.post('/', createTaskController);
router.get('/', getTasksController);

export default router;
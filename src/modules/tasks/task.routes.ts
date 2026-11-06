import {Router} from "express"
import {createTaskController, getTasksController, updateTaskController} from './task.controller';
import {authenticate} from '../../middleware/auth.middleware'

const router = Router({ mergeParams: true });

router.use(authenticate)
router.post('/', createTaskController);
router.get('/', getTasksController);
router.patch('/:taskId', updateTaskController);

export default router;
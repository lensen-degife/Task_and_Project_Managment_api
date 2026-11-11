import {Router} from "express"
import {createTaskController, getTasksController, updateTaskController,deleteTaskController} from './task.controller';
import {authenticate} from '../../middleware/auth.middleware'
import {validate} from '../../middleware/validate.middleware'
import {createTaskSchema, getTasksSchema,updateTaskSchema} from './task.validation'

const router = Router({ mergeParams: true });

router.use(authenticate)
router.post('/', validate(createTaskSchema), createTaskController);
router.get('/',validate(getTasksSchema, "query"), getTasksController);
router.patch('/:taskId',validate(updateTaskSchema), updateTaskController);
router.delete('/:taskId', deleteTaskController);

export default router;
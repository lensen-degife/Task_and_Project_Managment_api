import {Router} from "express"
import {createTaskController} from './task.controller';
import {authenticate} from '../../middleware/auth.middleware'

const router = Router({ mergeParams: true });

router.use(authenticate)
router.post('/', createTaskController);

export default router;
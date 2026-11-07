import {Router} from "express"
import {authenticate} from "../../middleware/auth.middleware"
import {createCommentController, getCommentsController, updateCommentsController, deleteCommentController} from "../comments/comment.controller"
import {createCommentSchema, updateCommentSchema} from './comment.validation'
import {validate} from '../../middleware/validate.middleware'
const router = Router({mergeParams: true});

router.use(authenticate);

router.post('/',validate(createCommentSchema), createCommentController);
router.get('/', getCommentsController);
router.patch('/:commentId',validate(updateCommentSchema), updateCommentsController);
router.delete('/:commentId', deleteCommentController)

export default router;
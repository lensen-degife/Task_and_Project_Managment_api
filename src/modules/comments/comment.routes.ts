import {Router} from "express"
import {authenticate} from "../../middleware/auth.middleware"
import {createCommentController, getCommentsController, updateCommentsController, deleteCommentController} from "../comments/comment.controller"

const router = Router({mergeParams: true});

router.use(authenticate);

router.post('/', createCommentController);
router.get('/', getCommentsController);
router.patch('/:commentId', updateCommentsController);
router.delete('/:commentId', deleteCommentController)

export default router;
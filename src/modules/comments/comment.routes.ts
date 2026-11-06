import {Router} from "express"
import {authenticate} from "../../middleware/auth.middleware"
import {createCommentController} from "../comments/comment.controller"

const router = Router({mergeParams: true});

router.use(authenticate);

router.post('/:taskId/comments', createCommentController);

export default router;
import {Router} from "express"
import {authenticate} from "../../middleware/auth.middleware"
import {createCommentController, getCommentsController} from "../comments/comment.controller"

const router = Router({mergeParams: true});

router.use(authenticate);

router.post('/', createCommentController);
router.get('/', getCommentsController);

export default router;
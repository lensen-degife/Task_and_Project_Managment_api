import {Router} from 'express';
import {authenticate} from '../../middleware/auth.middleware';
import {addProjectMemberController} from './members.controller'

const router = Router({mergeParams: true});

router.use(authenticate);

router.post('/members', addProjectMemberController)

export default router;
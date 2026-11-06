import {Router} from 'express';
import {authenticate} from '../../middleware/auth.middleware';
import {addProjectMemberController, getProjectMembersController, updateProjectMemberRoleController, removeProjectMemberController} from './members.controller'

const router = Router({mergeParams: true});

router.use(authenticate);

router.post('/members', addProjectMemberController);
router.get('/members', getProjectMembersController);
router.patch("/members/:memberId/role",updateProjectMemberRoleController);
router.delete("/members/:memberId",removeProjectMemberController);

export default router;
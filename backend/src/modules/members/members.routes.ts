import {Router} from 'express';
import {authenticate} from '../../middleware/auth.middleware';
import {addProjectMemberController, getProjectMembersController, updateProjectMemberRoleController, removeProjectMemberController} from './members.controller'
import {updateMemberRoleSchema} from './members.validation'
import {validate} from '../../middleware/validate.middleware'

const router = Router({mergeParams: true});

router.use(authenticate);

router.post('/members', addProjectMemberController);
router.get('/members', getProjectMembersController);
router.patch("/members/:memberId/role",validate(updateMemberRoleSchema),updateProjectMemberRoleController);
router.delete("/members/:memberId",removeProjectMemberController);

export default router;
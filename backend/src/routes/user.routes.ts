import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import * as userController from '../controllers/user.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import {
    createUserValidation,
    updateUserValidation,
    changePasswordValidation,
} from '../validation/user.validation';

const router = Router();

router.get('/', [authenticate, isAdmin], userController.getAllUsers);
router.get('/:id', [authenticate, isAdmin], userController.getUserById);
router.post('/', [authenticate, isAdmin, validate(createUserValidation)], userController.createUser);
router.put('/:id', [authenticate, isAdmin, validate(updateUserValidation)], userController.updateUser);
router.delete('/:id', [authenticate, isAdmin], userController.deleteUser);
router.post('/:id/restore', [authenticate, isAdmin], userController.restoreUser);
router.post('/:id/change-password', [authenticate, isAdmin, validate(changePasswordValidation)], userController.changePassword);

export default router;

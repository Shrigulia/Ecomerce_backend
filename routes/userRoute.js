import express from 'express';
import { deleteUser, deleteUserByAdmin, forgotPassword, getAllUsers, getMyProfile, getSignleUserDetail, login, logout, resendOTP, resetPassword, signUp, upadatePassword, updateRoleByAdmin, updateUserProfile, verify } from '../controller/userController.js';
import { authorizedRole, isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signUp)

router.post('/verify', isAuthenticated, verify)

router.post('/login', login)

router.get('/logout', logout)

router.get('/resendotp', isAuthenticated, resendOTP)

router.delete('/deleteuser', deleteUser)

router.get('/me', isAuthenticated, getMyProfile)

router.post('/password/forgot', forgotPassword)

router.put('/password/forgot/reset/:token', resetPassword)

router.put('/password/update', isAuthenticated, upadatePassword)

router.delete('/delete', isAuthenticated, deleteUser)

router.get('/me', isAuthenticated, getMyProfile)

router.put('/me/update', isAuthenticated, updateUserProfile)

// GET ALL USERS -- ADMIN
router.get('/admin/users', isAuthenticated, authorizedRole("admin"), getAllUsers)

// GET SINGLR USER DETAIL / UPDATE ROLE / DELETE USER -- ADMIN
router.route('/admin/user/:id')
    .get(isAuthenticated, authorizedRole("admin"), getSignleUserDetail)
    .put(isAuthenticated, authorizedRole("admin"), updateRoleByAdmin)
    .delete(isAuthenticated, authorizedRole("admin"), deleteUserByAdmin)

export default router;
import express from "express";
import { login, logout, refresh, register, registerAdmin, registerCustomer } from "../controller/authController.js";
import { deleteUser, getAllActiveAdmin, getAllActiveCustomers, getAllActiveUsers, getAllAdmin, getAllCustomers, getAllUsers, getLoggedUserAccountDetails, updateUser } from "../controller/userController.js";
import { genericMiddleware } from "../middleware/authenticate.js";

const authRouter = express.Router();

authRouter.post('/register', genericMiddleware, register);
authRouter.post('/register/customer', genericMiddleware, registerCustomer);
authRouter.post('/register/admin', genericMiddleware, registerAdmin);
authRouter.post('/login', login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);
authRouter.get('/getall', getAllUsers);
authRouter.get('/get/details/:userID', getLoggedUserAccountDetails);
authRouter.get('/getall/active', getAllActiveUsers);
authRouter.get('/getall/customers', getAllCustomers);
authRouter.get('/getall/customers/active', getAllActiveCustomers);
authRouter.get('/getall/admins', getAllAdmin);
authRouter.get('/getall/admins/active', getAllActiveAdmin);
authRouter.put('/update/:userID', genericMiddleware, updateUser);
authRouter.put('/delete/:userID', genericMiddleware, deleteUser);


export default authRouter;
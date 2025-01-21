import express, { Request, Response } from "express";
const { body, validationResult } = require("express-validator");

const user_information_Router = express.Router();


user_information_Router.post(
    "/user/information",
    // body("email").isEmail(),
    // body("password").isLength({ min: 8, max: 50 }),
    // body("username").isLength({ min: 6, max: 20 }),
    // body("first_name").isLength({ min: 3, max: 30 }),
    // body("last_name").isLength({ min: 3, max: 30 }),
  
    async (req: Request, res: Response) => {

        console.log("user information route");
        console.log(req.body);
         res.status(200).json({ message: "User information route" });
    })
export default user_information_Router;
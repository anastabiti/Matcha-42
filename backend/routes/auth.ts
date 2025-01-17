import express, { Request, Response } from "express";
import { session } from "../database";
const { body, validationResult } = require("express-validator");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authRouter = express.Router();

function generateAccessToken(username: String) {
  return jwt.sign(username, process.env.JWT_TOKEN_SECRET, {
    expiresIn: "7200s",
  }); //2 sway3
}

authRouter.post("/login", async (req: Request, res: Response) => {
  // const token = generateAccessToken({ username: req.body.username });
  // res.json(token);

  try {
    const password = req.body.password;
    console.log(password, " password");
    console.log(req.body.username, "  username");

    //get hashedPassword
    if (session) {
        const hashedPassword = await session.run(
            "MATCH (n:User) WHERE n.username = $username RETURN n.password",
            { username: req.body.username }
        );

        console.log(hashedPassword.records[0]._fields[0], " hashedPassword");
        if (hashedPassword.records.length > 0) {
            if (hashedPassword.records[0]._fields[0])
                bcrypt.compare(
                    password,
                    hashedPassword.records[0]._fields[0],
                    function (err: Error, result: any) {
                        if (result) {
                            console.log("passwords match");
                        } else {
                            console.log("passwords do not match");
                        }
                    }
                );
        }
    }

        res.send("login route");

  } catch {
    console.log("error");
    res.status(400).send("Error in login");
  }


});

export default authRouter;

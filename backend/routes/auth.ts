import express, { Request, Response } from "express";
import { session } from "../database";
import { env } from "process";
const { body, validationResult } = require("express-validator");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authRouter = express.Router();

function generateAccessToken(username: String) {
  if (username) {
    const token = jwt.sign({ userId: username }, process.env.JWT_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    console.log(token, " token");
    return token;
  }
  else {
    console.log("error in generating jwt");
    return null;
  }
}

authRouter.post("/login", async (req: Request, res: Response) => {
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
                //login successful i must generate a token
                console.log(req.body.username, " username");
                const user_ = req.body.username;
                if (user_) {
                  const token = generateAccessToken(user_);
                  console.log(token, " token");
                    // res.json(token);
                    res.cookie("jwt_token", token, { httpOnly: true });
                    res.send("login successful");
                }
                // res.json(token);
                // res.send("login successful");
              } else {
                console.log("passwords do not match");
              }
            }
          );
      }
    }

  } catch {
    console.log("error");
    res.status(400).send("Error in login");
  }
});

export default authRouter;

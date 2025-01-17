import express, { Request, Response } from "express";
import { session } from "../database";
import { env } from "process";
const { body, validationResult } = require("express-validator");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authRouter = express.Router();
const crypto = import("crypto");
import nodemailer from "nodemailer";
import { auth } from "neo4j-driver-core";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.google_mail,
    pass: process.env.google_app_password,
  },
});
function generateAccessToken(username: String) {
  if (username) {
    const token = jwt.sign({ userId: username }, process.env.JWT_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    console.log(token, " token");
    return token;
  } else {
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

authRouter.post(
  "/password_reset",

  body("email").isEmail(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    console.log(errors, "errors");

    if (!errors.isEmpty()) res.status(400).json({ errors: errors.array() });
    else {
      try {
        console.log(req.body.email, " email");
        const email = req.body.email;
        if (email) {
          if (session) {
            const url_token = jwt.sign(
              { email: email },
              process.env.JWT_TOKEN_SECRET,
              { expiresIn: "10min" }
            );

            const res_ = await session.run(
              `MATCH (n:User) WHERE n.email = $email
             SET n.password_reset_token = $url_token 
             RETURN n.email`,
              { email: email, url_token: url_token }
            );
            console.log(res_.records, " res_");
            if (res_.records.length > 0) {
              console.log(
                "password reset successful, check your email for further instructions"
              );
              ///////////////////

              const mailOptions = {
                from: "anastabiti@gmail.com",
                to: email,
                subject: "Reset Your password ,Tinder! 💖",
                text: `Hi ${email},
        
        Welcome use the link below to reset your password! 🎉        
        🔗 Reset Your Password: http://localhost:3000/api/reset_it?token=${url_token}
        
        
        Best regards,  
        The Tinder Team`,
              };

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error("Error sending email: ", error);
                } else {
                  console.log("Email sent: password reset ", info.response);
                }
              });

              res.send(
                "password reset successful, check your email for further instructions"
              );
            }
          } else {
            console.log("email does not exist");
            res.status(400).send("email does not exist");
          }
        }
      } catch (Error) {
        console.log("error");
        res.status(400).send("Error in password reset");
      }
    }
  }
);

// 
authRouter.get("/reset_it", 
// authRouter.patch("/reset_it",   body("password").isLength({ min: 6, max: 30 }),
async (req: Request, res: Response) => {
  // console.log(req.query.token, " token");
//   console.log(req.body.password, "password");
  try {
    const token = req.query.token;
    if (token) {
      const jwt_ = await jwt.verify(token, process.env.JWT_TOKEN_SECRET);

      console.log(jwt_, " jwt_");

      res.send("password reset api is called");
    }

    else //empty token
    res.status(400).send("invalid token");
  } catch {
    console.log("error in reset_it");
    res.status(400).send("Expired or invalid token");
  }
});

export default authRouter;

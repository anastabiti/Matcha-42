import express, { Request, Response } from "express";
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const crypto = import("crypto");

const passwordValidator = require("password-validator");
import nodemailer from "nodemailer";
import { driver } from "../database";

// Create a schema for password validation
const schema = new passwordValidator();
schema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(50) // Maximum length 100
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits(2) // Must have at least 2 digits
  .has()
  .not()
  .spaces() // Should not have spaces
  .has()
  .symbols(); // Must have at least 1 symbol
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
const registrationRouter = express.Router();

// registration route
registrationRouter.post(
  "/registration",
  body("email").isEmail().isLength({ min: 7, max: 30 }),
  body("password").isLength({ min: 8, max: 50 }),
  body("username").isLength({ min: 6, max: 20 }),
  body("first_name").isLength({ min: 3, max: 30 }),
  body("last_name").isLength({ min: 3, max: 30 }),

  async (req: Request, res: Response) => {
    if (schema.validate(req.body.password) === false) {
      res
        .status(400)
        .json(
          "Password must be between 8 and 50 characters, contain at least 2 digits, an uppercase letter, a lowercase letter and no spaces"
        );
      return;
    }
    const errors = validationResult(req);

    // console.log(errors.array()[0].msg, errors.array()[0].path, "errors");
    // {
    //   type: 'field',
    //   value: 'e',
    //   msg: 'Invalid value',
    //   path: 'password',
    //   location: 'body'
    // }
    if (!errors.isEmpty()) {
      if (errors.array()[0].path === "email")
        res.status(400).json("Invalid email");
      else if (errors.array()[0].path === "password")
        res.status(400).json("Password must be between 6 and 30 characters");
      else if (errors.array()[0].path === "username")
        res.status(400).json("Username must be between 6 and 20 characters");
      else if (errors.array()[0].path === "first_name")
        res.status(400).json("First name must be between 3 and 30 characters");
      else if (errors.array()[0].path === "last_name")
        res.status(400).json("Last name must be between 3 and 30 characters");
    } else {
      // console.log(req.body, 'req.body');
      // console.log(req.body.username, " username");
      // console.log(req.body.email, " email");
      // console.log(req.body.password, " password");
      // console.log(req.body.last_name, " last_name");
      // console.log(req.body.first_name, " first_name");

      // store these to neo4j
      // hash passwrod before storing it
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      const user = {
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        verfication_token: "",
        verified: false,
        password_reset_token: "",
        gender: "",
        biography: "",
        setup_done:false
      };
      const session = await driver.session();
      // console.log(process.env.database_username, process.env.database_password, "database");

      if (session && user) {
        console.log("session created");
        // First check if email exists
        const _check_email_ = await session.run(
          // "MATCH (u:User {email: $email}) RETURN u",
          "MATCH (u:User) WHERE u.email = $email RETURN u",
          { email: user.email, username: user.username }
        ); 
        const check_username = await session.run(
          "MATCH (u:User) WHERE u.username = $username RETURN u",
          { username: user.username }
        );


        if (_check_email_.records.length > 0) {
          res.status(400).json("Email already exists");
        }
       
        else if (check_username.records.length > 0) {
          res.status(400).json("Username already exists");
        } else {
          console.log("new User");
          user.verfication_token = (await crypto)
            .randomBytes(20)
            .toString("hex");
          console.log(user.verfication_token, "verfication_token");
          await session.run(
            `CREATE (a:User {username: $username, email: $email, password: $password,
             first_name: $first_name,
              last_name: $last_name,verified:false,
               verfication_token:$verfication_token,setup_done:$setup_done,
               
               pic_1: "",
              pic_2: "",
              pic_3: "",
              pic_4: "",
               password_reset_token:$password_reset_token}) RETURN a`,
            user
          );

          const mailOptions = {
            from: "anastabiti@gmail.com",
            to: user.email,
            subject: "Verify Your Email for Tinder! 💖",
            text: `Hi ${user.username},
            
            Welcome to Tinder, where sparks fly and hearts connect! 🎉
            
            Before you get started, please verify your email address to activate your account. Click the link below to complete the process:
            
            🔗 Verify Your Email: http://localhost:3000/api/verify-email?token=${user.verfication_token}
            
            If you didn’t create an account on Tinder, you can safely ignore this email.
            
            Let the love adventure begin! ❤️
            
            Best regards,  
            The Tinder Team`,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending email: ", error);
              //try agin after 5 seconds
              setTimeout(() => {
                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    console.error("Error sending email: ", error);
                  } else {
                    console.log("Email sent: ", info.response);
                  }
                });
              }, 5000);
            } else {
              console.log("Email sent: ", info.response);
            }
          });

          await session.close();
          res.status(200).json("User created successfully");
        }
      } else {
        await session.close();
        res.status(400).json("Error occured");
      }
    }
  }
);

// Verify email route
registrationRouter.get("/verify-email", async (req: Request, res: Response) => {
  try {

    const token = req.query.token;
    console.log(token, " token");
    if (token) {
      const session = driver.session();

      if (!session) {
        res.status(400);
        res.send("Error occured");
      }
      const updates = await session.run(
        `
          MATCH (a:User {verfication_token: $token})
          WHERE a.verified = false
          SET a.verfication_token = ""
          SET a.verified = true
          RETURN a.verfication_token , a.verified, a.email, a.username, a.first_name, a.last_name
          `,
        { token }
      );

      if (updates.records.length > 0) {
        const updatedUser = updates.records[0];
        console.log("User verified:", updatedUser);
        console.log("User verified:", updatedUser);
        res.send("Hello! Welcome to Matcha. Email verified successfully!");
        await session.close();
      } else {
        await session.close();
        res.status(400).send("Invalid or expired token");
      }
    } else {
      res.status(400);
      res.send("Invalid token");
    }
  } catch (error) {
    console.log(error, " error occured");
    res.status(400);
    res.send("Error occured");
  }
});

export default registrationRouter;

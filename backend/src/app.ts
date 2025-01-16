import express, { Application, Request, Response } from "express";
const bodyParser = require("body-parser");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const app: Application = express();
import { session } from "../database";
const crypto = import("crypto");
const formData = require('form-data');

import nodemailer from 'nodemailer';


require("../database/index.ts");

app.get("/", (req: Request, res: Response) => {
  res.send("Hello Welcome to Matcha!");
});

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
// Use body-parser middleware
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// registration route
app.post(
  "/registration",
  body("email").isEmail(),
  body("password").isLength({ min: 6, max: 30 }),
  body("username").isLength({ min: 6, max: 20 }),
  body("first_name").isLength({ min: 3, max: 30 }),
  body("last_name").isLength({ min: 3, max: 30 }),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    console.log(errors, "errors");

    if (!errors.isEmpty()) res.status(400).json({ errors: errors.array() });
    else {
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
        verfication_token:  "",
      };

      if (session) {
        // First check if email exists
        const _check_email_ = await session.run("MATCH (u:User {email: $email}) RETURN u",
          { email: user.email }
        );
        // console.log(_check_email_, "check email");

        if (_check_email_.records.length > 0) {
          res.status(400)
          res.send("Email already exists");
          
        } else {
          console.log("new User");
          user.verfication_token = (await crypto).randomBytes(20).toString('hex') 
          console.log(user.verfication_token, "verfication_token");
          await session.run(
            "CREATE (a:User {username: $username, email: $email, password: $password, first_name: $first_name, last_name: $last_name,verified:false, verfication_token:$verfication_token}) RETURN a",
            user
          );

          const mailOptions = {
            from: "anastabiti@gmail.com",
            to: "anasbitoo@gmail.com",
            subject: "Hello from Nodemailer",
            text: "This is a test email sent using Nodemailer.",
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending email: ", error);
            } else {
              console.log("Email sent: ", info.response);
            }
          });

      
        
          res.send("Hello Welcome to Matcha registration!");
        }
      }
    }
  }
);

export default app;

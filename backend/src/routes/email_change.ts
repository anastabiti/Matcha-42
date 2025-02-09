import express from "express";
import { body, ValidationError, validationResult } from "express-validator";
import neo4j from "neo4j-driver";
import { authenticateToken_Middleware, generateAccessToken } from "./auth";
// import bcrypt from "bcrypt";
import argon2 from "argon2";

import { transporter } from "./registration";
import { driver } from "../database";
// import jwt from 'jsonwebtoken';
const jwt = require("jsonwebtoken");

const email_change = express.Router();
// const driver = neo4j.driver(
//   "neo4j://localhost:7687",
//   neo4j.auth.basic(process.env.database_username as string, process.env.database_password as string)
// );
email_change.patch(
  "/change_email",
  authenticateToken_Middleware,
  body("newEmail")
    .notEmpty()
    .isLength({ min: 7, max: 100 })
    .withMessage("email cannot be empty")
    .isEmail(),
  async function (req: any, res: any) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0] as any;
      return res.status(400).json(`Invalid : ${firstError.path}`);
    }

    try {
      console.log(req.body, " -------req\n\n\n");
      console.log(req.user);
      const user = req.user;
      const new_email = req.body.newEmail;
      const password = req.body.password;

      const new_session = driver.session();
      if (new_session) {
        const check_usr_db = await new_session.run(
          `
            MATCH (n:User) WHERE n.username = $username 
            RETURN n
            `,
          { username: user.username }
        );
        if (check_usr_db.records.length > 0) {
          const tmp_user = check_usr_db.records[0].get(0).properties;
          console.log(
            tmp_user.password,
            " tmp_user.password ",
            password,
            " passwword---------------------------",
            user,
            "  user is\n\n\n\n"
          );

          // const check_pass = await bcrypt.compare(password, tmp_user.password);
          const check_pass = await argon2.verify(tmp_user.password,password);
          console.log(check_pass, " pass check");
          if (check_pass) {
            console.log(tmp_user, " user data");
            if (!tmp_user.verified) return res.status(400).json("User email is not verified");

            if (!tmp_user.setup_done) return res.status(400).json("User setup is not completed");
            //   Checks for both value and type equality. No type conversion occurs.
            if (new_email === tmp_user.email) return res.status(400).json("Same email!");
            const check_if_email_taken = await new_session.run(
              `
                MATCH (n:User) WHERE n.email = $email 
                RETURN n
                `,
              { email: new_email }
            );
            if (check_if_email_taken.records.length > 0)
              return res.status(400).json("email is taken");

            //generate jwt token
            const verfication_token = await jwt.sign(
              { username: tmp_user.username, new_email: new_email, old_email: tmp_user.email },
              process.env.JWT_TOKEN_SECRET,
              { expiresIn: "12min" }
            );
            //   const verfication_token = (await crypto).randomBytes(20).toString("hex");
            //send email verification
            const add_hash_to_user_db = await new_session.run(
              `
                MATCH (n:User) WHERE n.username = $username 
                SET n.verfication_token_email =$verfication_token
                RETURN n
                `,
              { username: tmp_user.username, verfication_token: verfication_token }
            );
            if (add_hash_to_user_db.records.length > 0) {
              const mailOptions = {
                from: "anastabiti@gmail.com",
                to: new_email,
                subject: "Verify Your New Email",
                text: `Hi ${user.username},
                      
                     You requested to change your email address. Before we update it, please confirm your new email by clicking the link below:

                            🔗 Confirm Your Email: ${process.env.back_end_ip}/api/verify-new-email?token=${verfication_token}

                            If you didn’t request this change, please ignore this email.

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
              await new_session.close();
              return res.status(200).json("SUCCESS");
            }
            await new_session.close();
            return res.status(400).json("FAILED");
          }
          else
          {
            return res.status(400).json("WRONG PASSWORD!");


          }
        }
      }
    } catch {
      return res.status(400).json("FAILED");
    }
  }
);

// ---------------
// Verify email route
email_change.get("/verify-new-email", async (req: any, res: any) => {
  try {
    const token = req.query.token;
    console.log(token, " token");
    if (token) {
      const session = driver.session();

      if (!session) {
        res.status(400);
        res.send("Error occured");
      }

      const decoded = await jwt.verify(token, process.env.JWT_TOKEN_SECRET as string);
      console.log(decoded, "decodeded asas");

      const updates = await session.run(
        `
            MATCH (a:User {verfication_token_email: $token})
            WHERE a.verified = true
            SET a.verfication_token_email = ""
            SET a.email = $email
            SET a.old_email = $old_email
            RETURN a
            `,
        { token: token, email: decoded.new_email ,old_email:decoded.old_email}
      );

      if (updates.records.length > 0) {
        const updatedUser = updates.records[0];
        console.log("User verified:", updatedUser);
        console.log("User verified:", updatedUser);
        res.status(200).json("Hello! New Email is  verified successfully!");
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
export default email_change;

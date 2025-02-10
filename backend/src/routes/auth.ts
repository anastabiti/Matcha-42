import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import argon2 from "argon2";

const authRouter = express.Router();

import nodemailer from "nodemailer";
import { driver } from "../database";
import { validateEmail, validatePassword, validateUsername } from "../validators/validate";
const crypto = import("crypto");

//define user model
export type User = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  verified: boolean;
  gender: string;
  biography: string;
  profile_picture: string;
  setup_done: boolean;
  verfication_token: string;
};

interface User_jwt {
  username: string;
  email: string;
  setup_done: boolean;
}
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

export function authenticateToken(req: any) {
  try {
    if (!req) return null;
    console.log(req.headers["cookie"], " ---> 1\n");

    let token = null;
    const cookies = req.headers.cookie?.split(";") || [];
    for (let cookie of cookies) {
      if (cookie.trim().startsWith("jwt_token=")) {
        token = cookie.split("=")[1];
        break;
      }
    }
    console.log(token, " ---- token");
    if (token != null) {
      const res = jwt.verify(token, process.env.JWT_TOKEN_SECRET as string);
      if (res) return res;
      else return null;
    } else return null;
  } catch {
    return null;
  }
}
// -----------------------------------------------
export const authenticateToken_Middleware = async (req: any, res: any, next: any) => {
  try {
    // console.log(req.headers["cookie"], " ---> req.headers\n");
    // console.log("inside middelware---------------------------")
    const session = driver.session();
    if (session) {
      let token = null;
      const cookies = req.headers.cookie?.split(";") || [];
      for (let cookie of cookies) {
        if (cookie.trim().startsWith("jwt_token=")) {
          token = cookie.split("=")[1];
          break;
        }
      }

      // console.log(token, " ---- token");

      if (!token) {
        return res.status(401).json("No token provided");
      }

      try {
        const decoded: any = await jwt.verify(token, process.env.JWT_TOKEN_SECRET as string);
        console.log(decoded.username, " decoded.username ----------------=-\n\n\n\n");
        const res_db = await session.run(
          `MATCH (n:User) WHERE n.username = $username AND n.is_logged = true
          RETURN n`,
          { username: decoded.username }
        );
        if (res_db.records.length <= 0) return res.status(401).json("User is Not looged");
        // Attach the decoded user to the request object
        req.user = decoded;
        next();
      } catch (err) {
        return res.status(403).json("Invalid token");
      }
    }
  } catch (error) {
    return res.status(401).json("error");
  }
};
// --------------------------------------------------
export function generateAccessToken(user: User_jwt) {
  if (!user || !user.username) {
    console.error("Invalid user data for token generation");
    return null;
  }

  try {
    const token = jwt.sign(
      {
        username: user.username,
        email: user.email,
        setup_done: user.setup_done,
      },
      process.env.JWT_TOKEN_SECRET as string,
      {
        expiresIn: "1h",
      }
    );
    console.log("Generated token:", token);
    return token;
  } catch (error) {
    console.error("Error generating JWT:", error);
    return null;
  }
}

// ----------------------------------------------------------------------------------
//  User/Password auth ---------------------------------------------------------------
// ----------------------------------------------------------------------------------

authRouter.post("/login",validateUsername, validatePassword, async (req: any, res: Response) => {
  try {
    const password = req.body.password;
    console.log(password, " password");
    console.log(req.body.username, "  username");
    const session = driver.session();
    if (session) {
      const user_data = await session.run(
        "MATCH (n:User) WHERE n.username = $username AND n.verified = true RETURN n",
        { username: req.body.username }
      );

      if (user_data.records.length > 0) {
        // console.log(user_data.records[0]._fields[0].properties, " user data");
        const user = await user_data.records[0]._fields[0].properties;
        // if (user.password) console.log(user.password, "password is ");
        console.log(user.password, " User passwordn\n\n\n\n");
        if (await argon2.verify(user.password, password)) {
          console.log("matched");
          const user_ = req.body.username;
          if (user_) {
            const token = generateAccessToken(user);
            if (!token) {
              console.error("Failed to generate authentication token");
              res.status(401).json({ error: "Authentication failed" });
              return;
            }
            console.log(token, " [-JWT TOKEN-]");
            //check later
            const res_db = await session.run(
              `MATCH (n:User) WHERE n.username = $username AND n.verified = true
                      SET n.is_logged  = true
                     RETURN n`,
              { username: user_ }
            );

            res.cookie("jwt_token", token, {
              httpOnly: true,
              sameSite: "lax",
              maxAge: 3600000, // 1 hour in milliseconds
            });

            if (user.setup_done == true) {
              res.status(200).json("login successful");
              return;
            } else {
              res.status(201).json("login successful");
              return;
            }
          }
        } else {
          console.log("username does not exist");
          res.status(400).json("Username does not exist or Email not verified");
          return;
        }
      }
      res.status(400).json("User does not exist");
      return;
    }
  } catch {
    res.status(400).json("Login failed");
    return;
  }
});

// ----------------------------------------------------------------------------------

authRouter.post("/password_reset", validateEmail, async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const session = driver.session();
    if (session) {
      const url_token = jwt.sign({ email: email }, process.env.JWT_TOKEN_SECRET as string, {
        expiresIn: "10min",
      });
      const res_ = await session.run(
        `MATCH (n:User) WHERE n.email = $email
            SET n.password_reset_token = $url_token 
            RETURN n.email`,
        { email: email, url_token: url_token }
      );

      if (res_.records.length > 0) {
        const mailOptions = {
          from: "anastabiti@gmail.com",
          to: email,
          subject: "Reset Your password ,Tinder! 💖",
          text: `Hi ${email},

        Welcome use the link below to reset your password! 🎉        
        🔗 Reset Your Password: ${process.env.front_end_ip}/resetPassword?token=${url_token}
        
        
        Best regards,  
        The Tinder Team`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            res.status(400).json("Failed to send email try again ! Thank you ");
            return;
          }
        });

        res
          .status(200)
          .json("password reset successful, check your email for further instructions");
        return;
      } else {
        res.status(400).json("email does not exist");
        return;
      }
    }
  } catch (Error) {
    res.status(400).json("Error in password reset");
    return;
  }
});

authRouter.patch("/reset_it", validatePassword, async (req: any, res: any) => {
  try {
    const token = req.body.token as string;
    const password = req.body.password;
    if (!token) {
      return res.status(400).send("Invalid token");
    }

    const jwt_: any = await jwt.verify(token, process.env.JWT_TOKEN_SECRET as string);
    console.log(jwt, " --------jwt");
    const new_session = driver.session();
    console.log(token, " token", password, " new password is \n\n\n", jwt_.email, " email }}>>>>");
    if (new_session) {
      const res = await new_session.run(
        `
            MATCH (n:User {email:$email})
            SET n.password = $password,
            n.password_reset_token = $tmp_password_reset_token
            RETURN n
            `,
        {
          email: jwt_.email,
          password: await argon2.hash(password),
          tmp_password_reset_token: (await crypto).randomBytes(25).toString("hex"),
        }
      );
    }
    return res.status(200).json("sucess");
  } catch (jwtError) {
    return res.status(400).send("Expired or invalid token");
  }
});

// --------------------------

authRouter.post("/logout", authenticateToken_Middleware, async (req: any, res: Response) => {
  console.log("log out -+==_==+++++_=>>.......???>>>>>>");
  try {
    const session = driver.session();
    if (session) {
      console.log(req.user);
      const res_db = await session.run(
        `MATCH (n:User) WHERE n.username = $username AND n.verified = true
       SET n.is_logged  = false
      RETURN n`,
        { username: req.user.username }
      );
      res.status(200).json("LOGOUT SUCCESSFULLY");
      return;
    } else {
      res.status(400).json("ERROR");
      return;
    }
  } catch {
    res.status(400).json("ERROR !");
    return;
  }
});

// ----------------------------------------------------------------------------------

export default authRouter;

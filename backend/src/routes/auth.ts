import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import nodemailer from "nodemailer";
import { driver } from "../database";
import { validateEmail, validatePassword, validateUsername } from "../validators/validate";
const crypto = import("crypto");
const authRouter = express.Router();

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

type User_jwt = {
  username: string;
  email: string;
  setup_done: boolean;
};
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

/**************************************************************************************************************
 * Authentication Middleware: Verifies JWT token and ensures the user is logged in.
 *
 * The middleware performs the following steps:
 * 1. Extracts the JWT token from the request cookies
 * 2. Checks if a token exists, and returns 401 if none is found
 * 3. Verifies the token's authenticity using the JWT_TOKEN_SECRET
 * 4. Queries the database to confirm the user exists and is logged in (is_logged = true)
 * 5. If verification succeeds:
 *    - Attaches the decoded user information to the request object
 *    - Calls the next middleware in the chain
 * 6. Returns appropriate error responses if verification fails
 * by  𝟏𝟑𝟑𝟕 𝐚𝐭𝐚𝐛𝐢𝐭𝐢 ʕʘ̅͜ʘ̅ʔ
 **************************************************************************************************************/
export async function authenticateToken_Middleware(req: any, res: any, next: any) {
  try {
    //* Creates a new database session using the Neo4j driver.
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

      if (!token) {
        return res.status(401).json("No token provided");
      }

      try {
        const decoded: any = await jwt.verify(token, process.env.JWT_TOKEN_SECRET as string); //type casting.

        const res_db = await session.run(
          `MATCH (n:User) WHERE n.username = $username AND n.is_logged = true
          RETURN n`,
          { username: decoded.username }
        );
        if (res_db.records.length <= 0) {
          await session.close();
          return res.status(401).json("User is Not looged");
        }
        /*
        User from DB: Record {
          keys: [ 'n' ],
          length: 1,
          _fields: [
            Node {
            identity: [Integer],
            labels: [Array],
            properties: [Object],
            elementId: '4:fb4b2d7a-4682-4a7e-b1cb-3d1b322bd728:654'
        }
        ],
          _fieldLookup: { n: 0 }
          } */
        

        // Attach the decoded user to the request object
        req.user = decoded;
        req.user.setup_done = res_db.records[0].get('n').properties.setup_done;

        
        await session.close();
        next();
      } catch (err) {
        return res.status(403).json("Invalid token");
      }
    }
  } catch (error) {
    return res.status(401).json("error");
  }
}

/**************************************************************************************************************
 * API to generate acess token AKA jwt
 *  by  𝟏𝟑𝟑𝟕 𝐚𝐭𝐚𝐛𝐢𝐭𝐢 ʕʘ̅͜ʘ̅ʔ
 **************************************************************************************************************/
export function generateAccessToken(user: User_jwt) {
  if (!user || !user.username) {
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

    return token;
  } catch (error) {
    return null;
  }
}

/**************************************************************************************************************
 * Login API: Authenticates a user by validating username and password.
 *
 * The endpoint performs the following steps:
 * 1. Validates both username and password through middleware
 * 2. Checks if the user exists in the database and has been verified
 * 3. Verifies the provided password against the stored hash using argon2
 * 4. If authentication is successful:
 *    - Generates a JWT token
 *    - Sets the user's 'is_logged' status to true in the database
 *    - Sets an HTTP-only cookie with the token (valid for 1 hour)
 *    - Returns status 200 if user setup is complete, or 201 if setup is pending
 * 5. Returns appropriate error messages if authentication fails:
 *    - Wrong password
 *    - User doesn't exist
 *    - General login failure
 *  by  𝟏𝟑𝟑𝟕 𝐚𝐭𝐚𝐛𝐢𝐭𝐢 ʕʘ̅͜ʘ̅ʔ
 **************************************************************************************************************/
authRouter.post("/login", validateUsername, validatePassword, async (req: any, res: Response) => {
  try {
    const password = req.body.password;

    const session = driver.session();
    if (session) {
      const user_data = await session.run(
        "MATCH (n:User) WHERE n.username = $username AND n.verified = true RETURN n",
        { username: req.body.username }
      );

      if (user_data.records.length > 0) {
        const user = await user_data.records[0]._fields[0].properties;

        if (await argon2.verify(user.password, password)) {
          if (user.username) {
            const token = generateAccessToken(user);
            if (!token) {
              res.status(401).json({ error: "Authentication failed" });
              return;
            }

            const res_db = await session.run(
              `MATCH (n:User) WHERE n.username = $username AND n.verified = true
                      SET n.is_logged  = true
                     RETURN n`,
              { username: user.username }
            );

            res.cookie("jwt_token", token, {
              httpOnly: true,
              sameSite: "strict",
              /*Strict not allows the cookie to be sent on a cross-site request or iframe. Lax allows GET only. None allows all the requests, but secure is required.
               */
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
          res.status(400).json("Problem in username!");
          return;
        } else {
          res.status(400).json("Wrong Password");
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

/**************************************************************************************************************
 * Reset Password API: it checks if email exists, then it will generate a reset token, store it in the database,
 * and send an email to the user with a link containing the token. The token expires in 10 minutes.
 * The link redirects to the frontend reset password page where the user can set a new password.
 * If the email doesn't exist in the database, it returns an error message.
 *  by  𝟏𝟑𝟑𝟕 𝐚𝐭𝐚𝐛𝐢𝐭𝐢 ʕʘ̅͜ʘ̅ʔ
 **************************************************************************************************************/
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
          subject: "Reset Your password ,Matcha! 💖",
          text: `Hi ${email},

        Welcome use the link below to reset your password! 🎉        
        🔗 Reset Your Password: ${process.env.front_end_ip}/resetPassword?token=${url_token}
        
        
        Best regards,  
        The Matcha Team`,
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
        await session.close();
        return;
      } else {
        res.status(400).json("email does not exist");
        await session.close();
        return;
      }
    }
  } catch (Error) {
    res.status(400).json("Error in password reset");
    return;
  }
});

/**************************************************************************************************************
 * Reset Password API: it verify the token and update old pass with the new one
 *  by  𝟏𝟑𝟑𝟕 𝐚𝐭𝐚𝐛𝐢𝐭𝐢 ʕʘ̅͜ʘ̅ʔ
 **************************************************************************************************************/

authRouter.patch("/reset_it", validatePassword, async (req: Request, res: Response) => {
  try {
    const token = req.body.token;
    const password = req.body.password;

    if (!token) {
      res.status(400).send("Invalid token");
      return;
    }
    const jwt_: any = jwt.verify(token, process.env.JWT_TOKEN_SECRET as string);
    const new_session = driver.session();
    if (new_session) {
      const db_res = await new_session.run(
        `
            MATCH (n:User) WHERE n.email = $email AND n.password_reset_token = $token
            SET n.password = $password,
            n.password_reset_token = $tmp_password_reset_token
            RETURN n
            `,
        {
          email: jwt_.email,
          token: token,
          password: await argon2.hash(password),
          tmp_password_reset_token: (await crypto).randomBytes(25).toString("hex"),
        }
      );

      if (db_res.records.length > 0) {
        res.status(200).json("success");
        await new_session.close();
        return;
      } else {
        res.status(400).json("Already Expired");
        await new_session.close();
        return;
      }
    }
    res.status(400).json("Invalid Token");
    return;
  } catch (jwtError) {
    res.status(400).json("Expired or invalid token");
    return;
  }
});

/**************************************************************************************************************
 * Logout API
 *  by  𝟏𝟑𝟑𝟕 𝐚𝐭𝐚𝐛𝐢𝐭𝐢 ʕʘ̅͜ʘ̅ʔ
 **************************************************************************************************************/
authRouter.post("/logout", authenticateToken_Middleware, async (req: any, res: Response) => {
  try {
    const session = driver.session();
    if (session) {
      const res_db = await session.run(
        `MATCH (n:User) WHERE n.username = $username
       SET n.is_logged  = false
      RETURN n`,
        { username: req.user.username }
      );
      await session.close();
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

export default authRouter;

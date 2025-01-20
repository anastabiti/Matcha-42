import express, { Request, Response } from "express";
import { env } from "process";
const { body, validationResult } = require("express-validator");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authRouter = express.Router();
const crypto = import("crypto");
import nodemailer from "nodemailer";
import { auth } from "neo4j-driver-core";
import { Profile, VerifyCallback } from "passport-google-oauth20";
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(
  "neo4j://localhost:7687",
  neo4j.auth.basic(process.env.database_username, process.env.database_password)
);

//define user model
export type User = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  verified: boolean;
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

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");

// ----------------------------------------------------------------------------------
//  FACEBOOK STRATEGY ---------------------------------------------------------------
// ----------------------------------------------------------------------------------

const FacebookStrategy = require("passport-facebook").Strategy;

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:3000/api/auth/facebook/callback",
      profileFields: ["id", "emails", "name"],
    },

    async function (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      cb: VerifyCallback
    ) {
      // {
      //   id: '1337',
      //   username: undefined,
      //   displayName: undefined,
      //   name: { familyName: 'Tabiti', givenName: 'Anas', middleName: undefined },
      //   gender: undefined,
      //   profileUrl: undefined,
      //   emails: [ { value: 'anastabiti@gmail.com' } ],
      //   provider: 'facebook',
      //   _raw: '{"id":"1337","email":"anastabiti\\u0040gmail.com","last_name":"Tabiti","first_name":"Anas"}',
      //   _json: {
      //     id: '1337',
      //     email: 'anastabiti@gmail.com',
      //     last_name: 'Tabiti',
      //     first_name: 'Anas'
      //   }
      // }  profile

      try {
        console.log(profile, " profile");

        const new_session = await driver.session();
        if (new_session) {
          const email_ = profile?._json.email;

          if (email_) {
            const resu_ = await new_session.run(
              `MATCH (n:User) WHERE n.email = $email
          RETURN {
          username: n.username,
          email: n.email,
          first_name: n.first_name,
          last_name: n.last_name,
          verified: n.verified
            } as user`,
              {
                email: email_,
              }
            );
            if (resu_.records?.length > 0) {
              //check if user is not verified
              console.log(
                resu_.records[0].get("user").verified,
                " -------------------------->"
              );
              //check if user is not verified
              if (resu_.records[0].get("user").verified === false) {
                console.log("email not verified");
                await new_session.close();
                return cb(null, false);
              }

              console.log("user exists", resu_.records[0].get("user"));
              const user_x = resu_.records[0]?.get("user");
              console.log(user_x, " user_x");
              await new_session.close();
              return cb(null, user_x);
            } 
            
            
            else {
              console.log("creating user");

              //check if username exists
              const check_username = await new_session.run(
                "MATCH (u:User) WHERE u.username = $username RETURN u",
                { username: profile?.name?.givenName }
              );
              let username_ = null;
              if (check_username.records.length > 0)
              {
                console.log("username exists -==--=-=-=-");
                username_ = (await crypto).randomBytes(12).toString("hex");
              }
    
                const user_ = await new_session.run(
                `CREATE (n:User {
                  username: $username,
                  email: $email,
                  password: $password,
                  first_name: $first_name,
                  last_name: $last_name,
                  verfication_token: $verfication_token,
                  verified: $verified,
                  password_reset_token: $password_reset_token
                }) 
                RETURN n.username`,
                {
                  username: username_ || profile?.name?.givenName,
                  // username: profile?.name?.givenName,
                  email: email_,
                  password: (await crypto).randomBytes(25).toString("hex"),
                  first_name: profile?.name?.givenName || "",
                  last_name: profile?.name?.familyName || "",
                  verfication_token: "",
                  verified: true,
                  password_reset_token: "",
                }
              );
              console.log("user does not exist");
              await new_session.close();
              return cb(null, user_);
            }
          }
        }
      } catch (error) {
        console.log("error ", error);
        return cb(error, false);
      }
    }
  )
);

authRouter.get(
  "/auth/facebook",
  passport.authenticate("facebook", { session: false }),
  async function (req: Request, res: Response) {
    // console.log("auth/facebook");
  }
);

authRouter.get(
  "/auth/facebook/callback",
  function (req: Request, res: Response) {
    passport.authenticate(
      "facebook",
      { session: false },
      function (err: any, user: User, info: any) {
        if (err) {
          return res
            .status(401)
            .json({ "Wrong credentials": "Error during authentication" });
        }

        if (!user) {
          console.error("No user found:", info);
          return res.status(401).json("No user found");
        }

        try {
          const token = generateAccessToken(user.username);
          console.log("Token generated:", token);

          res.cookie("jwt_token", token, {
            httpOnly: true, // Prevent client-side access
            sameSite: "strict", // Mitigate CSRF attacks
          });

          console.log("User successfully logged in with Facebook:", user);
          return res.status(200).json({
            message: "Logged in with Facebook",
            token,
          });
        } catch (tokenError) {
          return res.status(400).json("Error generating token");
        }
      }
    )(req, res);
  }
);
// ----------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------
//  intra42 STRATEGY ---------------------------------------------------------------
// ----------------------------------------------------------------------------------

const FortyTwoStrategy = require("passport-42").Strategy;
passport.use(
  new FortyTwoStrategy(
    {
      clientID: process.env.FORTYTWO_APP_ID,
      clientSecret: process.env.FORTYTWO_APP_SECRET,
      callbackURL: "http://localhost:3000/api/auth/intra42/callback",
    },

    async function (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      cb: VerifyCallback
    ) {
      try {
        //   id: '90435',
        // username: 'atabiti',
        // displayName: 'Anas Tabiti',
        // name: { familyName: 'Tabiti', givenName: 'Anas' },
        // profileUrl: 'https://api.intra.42.fr/v2/users/atabiti',
        // emails: [ { value: 'atabiti@student.1337.ma' } ],
        // phoneNumbers: [ { value: 'hidden' } ],
        // photos: [ { value: undefined } ],
        // provider: '42',
        console.log(profile.emails?.[0]?.value, " profile._json.email");
        console.log(profile?.name?.familyName, " familyname");
        console.log(profile?.name?.givenName, " givenName");
        console.log(profile.username, " username");

        const new_session = await driver.session();
        if (new_session) {
          const email_ = profile.emails?.[0]?.value || profile._json?.email;

          if (email_) {
            const resu_ = await new_session.run(
              `MATCH (n:User) WHERE n.email = $email
      RETURN {
      username: n.username,
      email: n.email,
      first_name: n.first_name,
      last_name: n.last_name,
      verified: n.verified
        } as user`,
              {
                email: email_,
              }
            );
            if (resu_.records?.length > 0) {
              //check if user is not
              console.log(
                resu_.records[0].get("user").verified,
                " -------------------------->"
              );
              //check if user is not verified
              if (resu_.records[0].get("user").verified === false) {
                console.log("email not verified");
                await new_session.close();
                return cb(null, false);
              }

              console.log("user exists", resu_.records[0].get("user"));
              const user_x = resu_.records[0]?.get("user");
              console.log(user_x, " user_x");
              await new_session.close();
              return cb(null, user_x);
            } else {
              console.log("creating user");
              const user_ = await new_session.run(
                `CREATE (n:User {
              username: $username,
              email: $email,
              password: $password,
              first_name: $first_name,
              last_name: $last_name,
              verfication_token: $verfication_token,
              verified: $verified,
              password_reset_token: $password_reset_token
            }) 
            RETURN n.username`,
                {
                  username:
                    profile?.name?.givenName +
                    (await crypto).randomBytes(2).toString("hex"),
                  email: email_,
                  password: (await crypto).randomBytes(25).toString("hex"),
                  first_name: profile?.name?.givenName || "",
                  last_name: profile?.name?.familyName || "",
                  verfication_token: "",
                  verified: true,
                  password_reset_token: "",
                }
              );
              console.log("user does not exist");
              await new_session.close();
              return cb(null, user_);
            }
          }
        }
      } catch (error) {
        console.log("error ", error);
        return cb(error, false);
      }
    }
  )
);

authRouter.get("/auth/intra42", passport.authenticate("42"));

// authRouter.get("/auth/intra42/callback", passport.authenticate("42", { session: false }), function (req: Request, res: Response) {
//   console.log("auth/intra42/callback is called");
// });

authRouter.get(
  "/auth/intra42/callback",
  function (req: Request, res: Response) {
    passport.authenticate(
      "42",
      { session: false },
      function (err: any, user: User, info: any) {
        if (err) {
          console.error("Error during authentication:", err);
          return res
            .status(401)
            .json({ "Wrong credentials": "Error during authentication" });
        }

        if (!user) {
          console.error("No user found:", info);
          return res.status(401).json("No user found");
        }

        try {
          const token = generateAccessToken(user.username);
          console.log("Token generated:", token);

          res.cookie("jwt_token", token, {
            httpOnly: true, // Prevent client-side access
            sameSite: "strict", // Mitigate CSRF attacks
          });

          console.log("User successfully logged in with 42:", user);
          return res.status(200).json({
            message: "Logged in with 42",
            token,
          });
        } catch (tokenError) {
          console.error("Error generating token:", tokenError);
          return res.status(400).json("Error generating token");
        }
      }
    )(req, res);
  }
);

// ------------------------------------------------------------------------------------------------

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
    const session = driver.session();
    //get hashedPassword
    if (session) {
      const hashedPassword = await session.run(
        "MATCH (n:User) WHERE n.username = $username AND n.verified = true RETURN n.password",
        { username: req.body.username }
      );

      // console.log(hashedPassword.records[0]._fields[0], " hashedPassword");
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
                  res.status(200).json("login successful");
                }
                // res.json(token);
                // res.send("login successful");
              } else {
                console.log("passwords do not match");
                res.status(400).json("passwords do not match");
              }
            }
          );
      } else {
        console.log("username does not exist");
        res.status(400).json("Username does not exist or Email not verified");
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
    console.log(errors, "errors-=-=-=---=-=-=-=-=");

    if (!errors.isEmpty()) res.status(400).json({ errors: errors.array() });
    else {
      try {
        console.log(req.body.email, " email");
        const email = req.body.email;
        const session = driver.session();
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

            res
              .status(200)
              .json(
                "password reset successful, check your email for further instructions"
              );
          } else {
            console.log("email does not exist");
            res.status(400).json("email does not exist");
          }
        }
      } catch (Error) {
        console.log("error");
        res.status(400).json("Error in password reset");
      }
    }
  }
);

//
authRouter.get(
  "/reset_it",
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
      } //empty token
      else res.status(400).send("invalid token");
    } catch {
      console.log("error in reset_it");
      res.status(400).send("Expired or invalid token");
    }
  }
);

// ----------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
    },

    async function (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      cb: VerifyCallback
    ) {
      console.log("----------------------------------------------");
      try {
        console.log(profile, " profile");
        console.log(accessToken, " accessToken");
        console.log(refreshToken, " refreshToken");
        const new_session = await driver.session();
        if (new_session) {
          console.log(profile?.emails?.[0].value || "email not found");
          if (profile?.emails?.[0].value) {
            const resu_ = await new_session.run(
              // `MATCH (n:User) WHERE n.email = $email RETURN {n.username, n.email, n.first_name, n.last_name, n.verified} as n`,
              `MATCH (n:User) WHERE n.email = $email
          RETURN {
          username: n.username,
          email: n.email,
          first_name: n.first_name,
          last_name: n.last_name,
          verified: n.verified
            } as user`,
              {
                email: profile.emails[0].value,
              }
            );
            if (resu_.records?.length > 0) {
              //check if user is not
              console.log(
                resu_.records[0].get("user").verified,
                " -------------------------->"
              );
              //check if user is not verified
              if (resu_.records[0].get("user").verified === false) {
                console.log("email not verified");
                await new_session.close();
                return cb(null, false);
              }

              console.log("user exists", resu_.records[0].get("user"));
              const user_x = resu_.records[0]?.get("user");
              console.log(user_x, " user_x");
              await new_session.close();
              return cb(null, user_x);
            } else {
              // {
              //   id: '333333',
              //   displayName: 'Anas TB',
              //   name: { familyName: 'TB', givenName: 'Anas' },
              //   emails: [ { value: 'anasbitoo@gmail.com', verified: true } ],
              //   photos: [
              //     {
              //       value: 'https://lh3.googleusercontent.com/a/ACg8ocKUs3odyO6AIVCpNfG8QwW9pqkk9YaRykdBFpcWVp_Uqad_DWpH=s96-c'
              //     }
              //   ],
              //   provider: 'google',
              //   _raw: '{\n' +
              //     '  "sub": "333",\n' +
              //     '  "name": "Anas TB",\n' +
              //     '  "given_name": "Anas",\n' +
              //     '  "family_name": "TB",\n' +
              //     '  "picture": "https://lh3.googleusercontent.com/a/ACg8ocKUs3odyO6AIVCpNfG8QwW9pqkk9YaRykdBFpcWVp_Uqad_DWpH\\u003ds96-c",\n' +
              //     '  "email": "anasbitoo@gmail.com",\n' +
              //     '  "email_verified": true\n' +
              //     '}',
              //   _json: {
              //     sub: '333',
              //     name: 'Anas TB',
              //     given_name: 'Anas',
              //     family_name: 'TB',
              //     picture: 'https://lh3.googleusercontent.com/a/ACg8ocKUs3odyO6AIVCpNfG8QwW9pqkk9YaRykdBFpcWVp_Uqad_DWpH=s96-c',
              //     email: 'anasbitoo@gmail.com',
              //     email_verified: true
              //   }
              // }
              // profile

              // const user = {
              //   username: req.body.username,
              //   email: req.body.email,
              //   password: hashedPassword,
              //   first_name: req.body.first_name,
              //   last_name: req.body.last_name,
              //   verfication_token: "",
              //   verified: false,
              //   password_reset_token: "",
              // };
              if (profile.emails?.[0].value) {

                //check if username exists
              const check_username = await new_session.run(
                "MATCH (u:User) WHERE u.username = $username RETURN u",
                { username: profile.displayName }
              );
              let username_ = null;
              if (check_username.records.length > 0)
              {
                console.log("username exists -==--=-=-=- Gooooooooooooooooooooogle");
                username_ = (await crypto).randomBytes(12).toString("hex");
              }



                console.log("creating user");
                const user_ = await new_session.run(
                  `CREATE (n:User {
                  username: $username,
                  email: $email,
                  password: $password,
                  first_name: $first_name,
                  last_name: $last_name,
                  verfication_token: $verfication_token,
                  verified: $verified,
                  password_reset_token: $password_reset_token
                }) 
                RETURN n.username`,
                  {
                    username: username_  || profile.displayName,
                      // profile.displayName ||
                      // (await crypto).randomBytes(10).toString(),
                    email: profile.emails[0].value,
                    password: (await crypto).randomBytes(25).toString("hex"),
                    first_name: profile?.name?.givenName || "",
                    last_name: profile?.name?.familyName || "",
                    verfication_token: "",
                    verified: true,
                    password_reset_token: "",
                  }
                );
                console.log("user does not exist");
                await new_session.close();
                return cb(null, user_);
              }
            }
          }
        }
      } catch (error) {
        console.log("error ", error);
        return cb(error, false);
      }
    }
  )
);

// ----------------------------------------------------------------------------------

// https://developers.google.com/identity/openid-connect/openid-connect
//omni auth
authRouter.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],

    session: false,
  }),
  async function (req: Request, res: Response) {
    // console.log("auth/google");
  }
);

authRouter.get("/auth/google/callback", function (req: Request, res: Response) {
  passport.authenticate(
    "google",
    { session: false },
    function (err: any, user: User, info: any) {
      if (err) {
        console.error("Error during authentication:", err);
        return res
          .status(401)
          .json({ "Wrong credentials": "Error during authentication" });
      }

      if (!user) {
        console.error("No user found:", info);
        return res.status(401).json("No user found");
      }

      try {
        const token = generateAccessToken(user.username);
        console.log("Token generated:", token);

        res.cookie("jwt_token", token, {
          httpOnly: true, // Prevent client-side access
          sameSite: "strict", // Mitigate CSRF attacks
        });

        console.log("User successfully logged in with Google:", user);
        return res.status(200).json({
          message: "Logged in with Google",
          token,
        });
      } catch (tokenError) {
        console.error("Error generating token:", tokenError);
        return res.status(400).json("Error generating token");
      }
    }
  )(req, res);
});

export default authRouter;


import express, { Request, Response } from "express";
import { env } from "process";
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Google_auth = express.Router();
const crypto = import("crypto");
import { Profile, VerifyCallback } from "passport-google-oauth20";
import { generateAccessToken, User } from "../auth";
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(
  "neo4j://localhost:7687",
  neo4j.auth.basic(process.env.database_username, process.env.database_password)
);

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");

// ----------------------------------------------------------------------------------
//  Google STRATEGY ---------------------------------------------------------------
// ----------------------------------------------------------------------------------
passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.back_end_ip}/api/auth/google/callback`,
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
                  SET n.is_logged = true
            RETURN {
            username: n.username,
            email: n.email,
            first_name: n.first_name,
            last_name: n.last_name,
            verified: n.verified,
      setup_done:n.setup_done
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
                  const cleanUsername =  profile.displayName?.trim() || '';

                  //check if username exists
                const check_username = await new_session.run(
                  "MATCH (u:User) WHERE u.username = $username RETURN u",
                  { username:cleanUsername}
                );
                console.log(cleanUsername, " profile.displayName.trim()---------------")
                let username_ = null;
                if (check_username.records.length > 0)
                {
                  console.log("username exists -==--=-=-=- Gooooooooooooooooooooogle");
                  username_ = (await crypto).randomBytes(12).toString("hex");
                }
  
  
  
                  console.log("creating user");
                  const result_ = await new_session.run(
                    `CREATE (n:User {
                    username: $username,
                    email: $email,
                    password: $password,
                    first_name: $first_name,
                    last_name: $last_name,
                    verfication_token: $verfication_token,
                    verified: $verified,
                    password_reset_token: $password_reset_token,
                    gender: "",
                    biography: "",
                    setup_done:false,
                      pics: [],
                        fame_rating:0,            
                      age:18
              is_logged:  true
                  }) 
                   RETURN {
      username: n.username,
      email: n.email,
      first_name: n.first_name,
      last_name: n.last_name,
      verified: n.verified,
      setup_done:n.setup_done
        } as user`,
                    {
                      username: username_  || cleanUsername,
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
                  const new_user = result_ .records[0]?.get("user");
                  await new_session.close();
                  return cb(null, new_user);
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
  Google_auth.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
  
      // session: false,
    }),
    async function (req: Request, res: Response) {
      // console.log("auth/google");
    }
  );
  
  Google_auth.get("/auth/google/callback", function (req: any, res: Response) {
    passport.authenticate(
      "google",
      { session: false },
      async function (err: any, user: User, info: any) {
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
        //   req.session.user = {
        //     username: user.username,
        //     email: user.email,
        //     setup_done: user.setup_done,
        //   };
        //   console.log(req.session.user, " session user");
        //  await req.session.save();

        const token = await generateAccessToken(user);
        if (!token) {
          console.error("Failed to generate authentication token");
          return res.status(401).json({ error: "Authentication failed" });
        }
        console.log(token, " [-JWT TOKEN-]");

        res.cookie("jwt_token", token, {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 3600000, // 1 hour in milliseconds
        });

          // return res.status(200).json("login successful");
          if ( user.setup_done == true) {
            return res.status(200).redirect(`${process.env.front_end_ip}/home`);
          } else {
            return res.status(200).redirect(`${process.env.front_end_ip}/setup`);
          }

        } catch (tokenError) {
          console.error("Error generating token:", tokenError);
          return res.status(400).json("Error generating token");
        }
      }
    )(req, res);
  });
  export default Google_auth;
import express, { Request, Response } from "express";
import { env } from "process";
const router = express.Router();
const jwt = require("jsonwebtoken");
const Google_auth = express.Router();
const crypto = import("crypto");
import { Profile, VerifyCallback } from "passport-google-oauth20";
import { generateAccessToken, User } from "../auth";
import { driver } from "../../database";
const neo4j = require("neo4j-driver");
import argon2 from "argon2";
import { catchAuthErrors } from "./42stra";

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
      // console.log("----------------------------------------------");
      try {
        // console.log(profile, " profile");
        // console.log(accessToken, " accessToken");
        // console.log(refreshToken, " refreshToken");
        const new_session = await driver.session();
        if (new_session) {
          // console.log(profile?.emails?.[0].value || "email not found");
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
              // console.log(resu_.records[0].get("user").verified, " -------------------------->");
              //check if user is not verified
              if (resu_.records[0].get("user").verified === false) {
                // console.log("email not verified");
                await new_session.close();
                return cb(null, false);
              }

              // console.log("user exists", resu_.records[0].get("user"));
              const user_x = resu_.records[0]?.get("user");
              // console.log(user_x, " user_x");
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
                // /g is a flag in regular expressions that stands for "global"
                const cleanUsername = profile.displayName?.replace(/ /g, "") || "";

                //check if username exists
                const check_username = await new_session.run(
                  "MATCH (u:User) WHERE u.username = $username RETURN u",
                  { username: cleanUsername }
                );
                let username_ = null;
                if (check_username.records.length > 0) {
                  // console.log("username exists -==--=-=-=- Gooooooooooooooooooooogle");
                  username_ = (await crypto).randomBytes(12).toString("hex");
                }

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
                      pics: ["","","","",""],notifications:[],
                        fame_rating:0,            
                      age:toFloat(18),
              is_logged:  true,
    country: "",
    city: "",
    country_WTK: "",
    city_WTK: "",
    location: null,
    location_WTK: null
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
                    username: username_ || cleanUsername,
                    // profile.displayName ||
                    // (await crypto).randomBytes(10).toString(),
                    email: profile.emails[0].value,
                    password: await argon2.hash((await crypto).randomBytes(25).toString("hex")),
                    first_name: profile?.name?.givenName || "",
                    last_name: profile?.name?.familyName || "",
                    verfication_token: "",
                    verified: true,
                    password_reset_token: "",
                  }
                );
                const new_user = result_.records[0]?.get("user");
                await new_session.close();
                return cb(null, new_user);
              }
            }
          }
        }
      } catch (error) {
        // console.log("error ", error);
        return cb(error, false);
      }
    }
  )
);

// ----------------------------------------------------------------------------------

// https://developers.google.com/identity/openid-connect/openid-connect
Google_auth.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
  async function (req: Request, res: Response) {}
);

// ----------------------------------------------------------------------------------

Google_auth.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  catchAuthErrors,
  async function (req: any, res: any, next: any) {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect(`${process.env.front_end_ip}/login?error=no_user`);
      }

      const token = generateAccessToken(user);
      res.cookie("jwt_token", token, {
        httpOnly: true,

        /*What Does the HttpOnly Cookie Flag Do?
    The HttpOnly cookie flag is often added to cookies that may contain sensitive information about the user.
    Essentially, this type of flag tells the server to not reveal cookie information contained in embedded scripts. 
    HttpOnly also tells the server that the information contained in the flagged cookies should not be transferred beyond the server. 
    This flag is especially important in protecting secure information that could be compromised during a cross-site request forgery (CSRF) attack or 
    if there is a flaw in the code that causes cross-site scripting (XSS). Both of these instances could lead user data to be leaked to hackers */
        maxAge: 3600000, // 1 hour in milliseconds
      });

      res.redirect(`${process.env.front_end_ip}${user.setup_done ? "/discover" : "/setup"}`);
    } catch (error) {
      return res.redirect(`${process.env.front_end_ip}/login?error=error`);
    }
  }
);

export default Google_auth;

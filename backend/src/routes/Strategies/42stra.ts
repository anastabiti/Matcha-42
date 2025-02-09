import express, { Request, Response } from "express";
import { env } from "process";
const { body, validationResult } = require("express-validator");
const router = express.Router();
const jwt = require("jsonwebtoken");


const forty_two_str = express.Router();
const crypto = import("crypto");
import nodemailer from "nodemailer";
import { auth } from "neo4j-driver-core";
import { Profile, VerifyCallback } from "passport-google-oauth20";
import { generateAccessToken, User } from "../auth";
import { driver } from "../../database";
const neo4j = require("neo4j-driver");

const passport = require("passport");

// ----------------------------------------------------------------------------------
//  intra42 STRATEGY ---------------------------------------------------------------
// ----------------------------------------------------------------------------------

//////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////CIPHERS////////////////////////////////////////////////////
export const create_new_user_cipher = `CREATE (n:User {
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
              setup_done: false,
               pics: ["","","","",""],
              fame_rating:0,            
              is_logged:  true,
              age:18,notifications:[],
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
              }   
            
              AS user`;
//////////////////////////////////////////////////////////////////////////////////////////////////////

const FortyTwoStrategy = require("passport-42").Strategy;
passport.use(
  new FortyTwoStrategy(
    {
      clientID: process.env.FORTYTWO_APP_ID,
      clientSecret: process.env.FORTYTWO_APP_SECRET,
      callbackURL: `${process.env.back_end_ip}/api/auth/intra42/callback`,
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
        console.log(profile.id, "  42 profile");
        const new_session = await driver.session();
        if (new_session) {
          const email_ = profile.emails?.[0]?.value || profile._json?.email;

          if (email_) {
            //case: user with the same email can looged in with omntiauth
            const resu_ = await new_session.run(
              `
                MATCH (n:User)
                WHERE n.email = $email
                SET n.is_logged = true
                RETURN {
                  username: n.username,
                  email: n.email,
                  first_name: n.first_name,
                  last_name: n.last_name,
                  verified: n.verified,
                  setup_done:n.setup_done
                } AS user`,
              {
                email: email_,
              }
            );
            if (resu_.records?.length > 0) {
              //check if user is not verified
              if (resu_.records[0].get("user").verified === false) {
                await new_session.close();
                return cb(null, false);
              }

              const user_x = resu_.records[0]?.get("user");

              await new_session.close();

              return cb(null, user_x);
            } else {
              console.log(
                " create a new User 42 auth--------------- \n\n\n\n",
                profile.username,
                " ]\n\n\n"
              );
              if (profile.username) {
                const check_useername_exists = await new_session.run(
                  `MATCH (n:User) WHERE n.username  = $username return n`,
                  { username: profile.username }
                );
                if (check_useername_exists.records?.length > 0) {
                  //case: user registered with a username like "atabiti" , then a user with diff email logged with 42, but he has the same username "atabiti", i have to generate a new username for him.
                  console.log("[------same username found----] , ", check_useername_exists.records);
                  const diff_username =
                    profile.username + "_" + (await crypto).randomBytes(10).toString("hex");
                  const result_ = await new_session.run(create_new_user_cipher, {
                    username: diff_username,
                    email: email_,
                    password: (await crypto).randomBytes(25).toString("hex"),
                    first_name: profile?.name?.givenName || "",
                    last_name: profile?.name?.familyName || "",
                    verfication_token: "",
                    verified: true,
                    password_reset_token: "",
                  });

                  const new_user = result_.records[0]?.get("user");
                  await new_session.close();
                  return cb(null, new_user);
                }
              }
              //case create a new fresh account
              const result_ = await new_session.run(create_new_user_cipher, {
                username: profile.username,
                email: email_,
                password: (await crypto).randomBytes(25).toString("hex"),
                first_name: profile?.name?.givenName || "",
                last_name: profile?.name?.familyName || "",
                verfication_token: "",
                verified: true,
                password_reset_token: "",
              });

              const new_user = result_.records[0]?.get("user");
              await new_session.close();
              return cb(null, new_user);
            }
          }
        }
      } catch (error) {
        return cb(error, false);
      }
    }
  )
);

forty_two_str.get("/auth/intra42", passport.authenticate("42"));

forty_two_str.get("/auth/intra42/callback", function (req: any, res: Response) {
  passport.authenticate("42", { session: false }, async function (err: any, user: User, info: any) {
    try {
      if (err) {
        console.error("Error during authentication:");
        return res.status(401).json({ "Wrong credentials": "Error during authentication" });
      }

      if (!user) {
        console.error("No user found:", info);
        return res.status(401).json("No user found");
      }

      //   " done--------------------------------------------------------\
      //   --------------------------------"
      // );

      // req.session.user = {
      //   username: user.username,
      //   email: user.email,
      //   setup_done: user.setup_done,
      // };
      // await req.session.save();

      const token = generateAccessToken(user);
      if (!token) {
        console.error("Failed to generate authentication token");
        return res.status(401).json({ error: "Authentication failed" });
      }

      res.cookie("jwt_token", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 3600000, // 1 hour in milliseconds
      });

      if (user.setup_done) {
        return res.status(200).redirect(`${process.env.front_end_ip}/discover`);
      } else {
        return res.status(200).redirect(`${process.env.front_end_ip}/setup`);
      }
    } catch (tokenError) {
      console.error("Error generating token:", tokenError);
      return res.status(400).json("Error generating token");
    }
  })(req, res);
});
export default forty_two_str;
// atabiti_a
//sjnj^*7t87t877dsKK

import express, { Request, Response } from "express";
import { env } from "process";
const router = express.Router();
const jwt = require("jsonwebtoken");
const discord_auth = express.Router();
const crypto = import("crypto");
import nodemailer from "nodemailer";
import { auth } from "neo4j-driver-core";
import { Profile, VerifyCallback } from "passport-google-oauth20";
import { generateAccessToken, User } from "../auth";
import { driver } from "../../database";
const neo4j = require("neo4j-driver");

import argon2 from "argon2";

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
              age:18,
              notifications:[],
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

var scopes = ["identify", "email"];

var DiscordStrategy = require("passport-discord").Strategy;
passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: `${process.env.back_end_ip}/api/auth/discord/callback`,
      scope: scopes,
    },

    async function (accessToken: string, refreshToken: string, profile: any, cb: VerifyCallback) {
      try {
        // {
        //     id: '904690300059017262',
        //     username: 'test',
        //     avatar: '',
        //     discriminator: '0',
        //     public_flags: 64,
        //     flags: 64,
        //     banner: null,
        //     accent_color: 4253569,
        //     global_name: '! 𝔞𝔱𝔞𝔟𝔦𝔱𝔦',
        //     avatar_decoration_data: {
        //       asset: '',
        //       sku_id: '',
        //       expires_at: 1739001600
        //     },
        //     banner_color: '#40e781',
        //     clan: null,
        //     primary_guild: null,
        //     mfa_enabled: true,
        //     locale: 'en-US',
        //     premium_type: 0,
        //     email: 'test@gmail.com',
        //     verified: true,
        //     provider: 'discord',
        //     accessToken: '',
        //     fetchedAt: 2025-02-04T18:08:15.618Z
        //   }
        console.log(profile.email, "  profile--------");
        const new_session = await driver.session();
        if (new_session) {
          const email_ = profile.email;
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
                " create a new User discord auth--------------- \n\n\n\n",
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
                    first_name: profile.global_name || "",
                    last_name: profile?.global_name || "",
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
                password: await argon2.hash((await crypto).randomBytes(25).toString("hex")),
                first_name: profile.global_name || "",
                last_name: profile.global_name || "",
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

discord_auth.get("/auth/discord", passport.authenticate("discord"));

discord_auth.get("/auth/discord/callback", function (req: any, res: Response) {
  passport.authenticate(
    "discord",
    { session: false },
    async function (err: any, user: User, info: any) {
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
    }
  )(req, res);
});
export default discord_auth;

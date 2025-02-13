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
import { catchAuthErrors } from "./42stra";

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

// ---------------------------------------------------
discord_auth.get("/auth/discord", passport.authenticate("discord"));

// ---------------------------------------------------

discord_auth.get(
  "/auth/discord/callback",
  passport.authenticate("discord", { session: false }),
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

export default discord_auth;

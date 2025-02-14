import express, { Request, Response } from "express";
import argon2 from "argon2";
import { Router as FortyTwoRouter } from "express";
import * as crypto from "crypto";
import { Profile, VerifyCallback } from "passport-google-oauth20";
import { generateAccessToken, User } from "../auth";
import { driver } from "../../database";
import passport from "passport";
const forty_two_str = express.Router();

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
        //   id: '....',
        // username: 'login',
        // displayName: 'Anas ....',
        // name: { familyName: '.....', givenName: 'Anas' },
        // profileUrl: 'https://api.intra.42.fr/v2/users/login',
        // emails: [ { value: 'login@student.1337.ma' } ],
        // phoneNumbers: [ { value: 'hidden' } ],
        // photos: [ { value: undefined } ],
        // provider: '42',

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
              if (profile.username) {
                const check_useername_exists = await new_session.run(
                  `MATCH (n:User) WHERE n.username  = $username return n`,
                  { username: profile.username }
                );

                if (check_useername_exists.records?.length > 0) {
                  //case: user registered with a username like "atabiti" , then a user with diff email logged with 42, but he has the same username "atabiti", i have to generate a new username for him.
                  // console.log("[------same username found----] , ", check_useername_exists.records);
                  const diff_username =
                    profile.username + "_" + (await crypto).randomBytes(10).toString("hex");
                  const result_ = await new_session.run(create_new_user_cipher, {
                    username: diff_username,
                    email: email_,
                    password: await argon2.hash((await crypto).randomBytes(25).toString("hex")),
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
                password: await argon2.hash((await crypto).randomBytes(25).toString("hex")),
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

/*--------------------------------------------------------------------------------------------------------------------------*/

forty_two_str.get("/auth/intra42", passport.authenticate("42"));

/*--------------------------------------------------------------------------------------------------------------------------*/

// forty_two_str.get("/auth/intra42/callback", async function (req: any, res: Response)
//  {
//   passport.authenticate("42", { session: false }, async function (err: any, user: User, info: any) {
//     try {
//       if (err) {
//         console.error("Error during authentication:");
//         return res.status(401).json({ "Wrong credentials": "Error during authentication" });
//       }

//       if (!user) {
//         console.error("No user found:", info);
//         return res.status(401).json("No user found");
//       }

//       const token = generateAccessToken(user);
//       if (!token) {
//         console.error("Failed to generate authentication token");
//         return res.status(401).json({ error: "Authentication failed" });
//       }

//       res.cookie("jwt_token", token, {
//         httpOnly: true,
//         sameSite: "lax",
//         maxAge: 3600000, // 1 hour in milliseconds
//       });

//       if (user.setup_done) {
//         return res.status(200).redirect(`${process.env.front_end_ip}/discover`);
//       } else {
//         return res.status(200).redirect(`${process.env.front_end_ip}/setup`);
//       }
//     } catch (tokenError) {
//       console.error("Error generating token:", tokenError);
//       return res.status(400).json("Error generating token");
//     }
//   })(req, res);
// });

export const catchAuthErrors = (err: any, req: any, res: any, next: any) => {
  // console.log(err.status, " ----err.status----");
  if (err.status === 500 || err instanceof Error) {
    return res.redirect(`${process.env.front_end_ip}/login?error=server_error`);
  }
  // next(err);
};

forty_two_str.get(
  "/auth/intra42/callback",
  passport.authenticate("42", { session: false }),
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

export default forty_two_str;

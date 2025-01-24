import express, { Request, Response } from "express";
const { body, validationResult } = require("express-validator");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(
  "neo4j://localhost:7687",
  neo4j.auth.basic(process.env.database_username, process.env.database_password)
);
const user_information_Router = express.Router();

// {
//     gender: 'Homosexual',
//     sexual_preferences: '',
//     biography: 'wewewe',
//     interests: [ 'Photography', 'Shopping', 'Tennis', 'Art' ]
//   }
user_information_Router.post(
  "/user/information",
  body("gender").notEmpty().withMessage("Gender cannot be empty"),
  body("biography").notEmpty().withMessage("Biography cannot be empty"),

  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const _user = req.session.user;
    if (!_user) return res.status(401).json("Unauthorized");
    else {
      console.log("------------------------------------------------------");
      console.log(_user, " 1");
      console.log("------------------------------------------------------");
      console.log(req.body.interests, " 2");
      console.log("------------------------------------------------------");
      console.log(req.body.gender, "3");
      console.log("------------------------------------------------------");

      if (req.session.user.username) {
        const session = driver.session();
        if (session) {
          if (req.body.interests) {
            for (const interest of req.body.interests) {
              await session.run(
                `MATCH (u:User {username: $username})
                MERGE (t:Tags {interests: $interests})
                MERGE (u)-[:has_this_interest]->(t)`,
                {
                  username: req.session.user.username,
                  interests: interest,
                }
              );
            }
          }
          console.log(_user.username, " _user.username--=-=-==--=");
          if (req.body.biography) {
            // "MATCH (n:User) WHERE n.username = $username AND n.verified = true RETURN n.password",
            console.log(
              typeof {
                _username: _user.username,
                biography: req.body.biography,
              }
            );

            await session.run(
              `MATCH (n:User) WHERE n.username = $username
                        SET n.biography = $biography
                        RETURN n.username
              `,
              { username: _user.username, biography: req.body.biography }
            );
          }
          if (req.body.gender) {
            //delete old gender
            await session.run(
              `MATCH (u:User {username: $username})-[r:onta_wla_dakar]->(g:Sex)
              DELETE r`,
              { username: _user.username}
            );

            await session.run(
              `MATCH (U:User) WHERE U.username = $username
              MATCH (G:Sex) WHERE G.gender = $gender
              MERGE (U)-[:onta_wla_dakar]->(G)

    `,

              { username: _user.username, gender: req.body.gender }
            );
          }
        }

        await session.close();
        return res.status(200).json("User information route");
      }
    }
    return res.status(401).json("Unauthorized");
  }
  //   }
);
export default user_information_Router;
// tmpuser
//sklsdkKkd78*&KJ

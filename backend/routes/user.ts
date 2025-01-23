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
  //   body("gender").isEmpty(),
  //   body("biography").isEmpty(),

  async (req: any, res: Response) => {
    const errors = validationResult(req);
    // if (!errors.isEmpty())
    //    res.status(400).json({ errors: errors.array() });
    // else {
    //get user looged in
    // console.log(req.session.user.username, "  ===}}}}}}}]]]]]");
    const _user = req.session.user;
    if (!_user) res.status(401).json("Unauthorized");
    else {
      console.log("user information route");
      console.log(_user , "------------------------------------------------------");
      console.log(req.body.interests);
      if (req.body && req.session.user.username) {
        const session = driver.session();
        if (session) {
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

        await session.close();
      }
      res.status(200).json("User information route");
    }
  }
  //   }
);
export default user_information_Router;
// tmpuser
//sklsdkKkd78*&KJ
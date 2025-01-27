import express, { Request, Response } from "express";
import { imagekitUploader } from "./../app";
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

    const _user =await req.session.user;
    if (!_user) return res.status(401).json("Unauthorized");
    else {
      console.log("------------------------------------------------------");
      console.log(_user, " 1");
      console.log("------------------------------------------------------");
      console.log(req.body.interests, " 2");
      console.log("------------------------------------------------------");
      console.log(req.body.gender, "3");
      console.log("------------------------------------------------------");

      if (_user.username) {
        console.log(_user.setup_done , " req.session.setup_done")
        if(_user.setup_done == true)
        {
          return res.status(400).json("Already done");
        }
        const session = driver.session();
        if (session) {
          if (await req.body.interests) {
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
          if (await req.body.biography) {
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
                        SET n.setup_done = true
                        RETURN n.username
              `,
              { username: _user.username, biography: req.body.biography }
            );
          }
          if (await req.body.gender) {
            //delete old gender
            await session.run(
              `MATCH (u:User {username: $username})-[r:onta_wla_dakar]->(g:Sex)
              DELETE r`,
              { username: _user.username }
            );

            await session.run(
              `MATCH (U:User) WHERE U.username = $username
              MATCH (G:Sex) WHERE G.gender = $gender
              MERGE (U)-[:onta_wla_dakar]->(G)

    `,

              { username: _user.username, gender: await req.body.gender }
            );
          }
          
        }


        await session.close();
        req.session.user.setup_done = true
        await req.session.save();

                return res.status(200).json("User information route");
      }
    }
    return res.status(401).json("Unauthorized");
  }
  //   }
);

user_information_Router.post(
  "/user/upload",
  async function (req: any, res: any) {
    // try {
      const _user = req.session.user;
      if (!_user) return res.status(401).json("Unauthorized");
    try {
      const files = req.files; // Access all uploaded files

      console.log(files, "  -?files ")
      console.log(Object.keys(files).length, "  -?count files-------------------------------------------------------------------- ")
      // console.log(files[0], "  [0] ")
      // console.log(files.image_hna, "  [1] ")
      console.log(files.image_hna_0, "  [1] ")
      console.log(files.image_hna_1, "  [1] ")
      // console.log(files.image_hna_1, "  [1] ")
      const img_count = Object.keys(files).length
      const session = driver.session(); // Open a Neo4j session
      let profilePictureSet = false;
      if( img_count <= 0 )
        return res.status(400).json("NO images.");
      for (let i = 0; i < img_count; i++) {
        const key = `image_hna_${i}`;
        const file = files[key];

        if (!file || key === "NULL") {
          console.log(`Skipping ${key}, no file uploaded.`);
          continue; // Skip null or missing files
        }

        // Upload to ImageKit
        const ret = await imagekitUploader.upload({
          file: file.data,
          fileName: file.name,
        });
        console.log(ret, "<- Uploaded file response");

        // Update Neo4j based on file index
        if (!profilePictureSet && i === 0) {
          // Set profile picture for the first valid file
          await session.run(
            `MATCH (u:User {username: $username})
             SET u.profile_picture = $profile_picture
             RETURN u.profile_picture`,
            { username: _user.username, profile_picture: ret.url }
          );
          profilePictureSet = true;
        } else {
          // Set additional pictures with dynamic properties
          await session.run(
            `MATCH (u:User {username: $username})
             SET u.pic_${i} = $url
             RETURN u.pic_${i}`,
            { username: _user.username, url: ret.url }
          );
        }
      }

      session.close(); // Close Neo4j session
      return res.status(200).json("Images uploaded successfully.");
    } catch (error) {
      console.error("Image upload failed:", error);
      return res.status(400).json("Image upload failed.");
    }
  }
);

export default user_information_Router;
// tmpuser
//sklsdkKkd78*&KJ

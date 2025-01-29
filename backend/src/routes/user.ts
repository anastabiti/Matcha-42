import express from "express";
import { body, validationResult } from "express-validator";
import neo4j from "neo4j-driver";
import { imagekitUploader } from "./../app";
import {
  authenticateToken,
  authenticateToken_Middleware,
  generateAccessToken,
} from "./auth";

const user_information_Router = express.Router();
const driver = neo4j.driver(
  "neo4j://localhost:7687",
  neo4j.auth.basic(
    process.env.database_username as string,
    process.env.database_password as string
  )
);
user_information_Router.post(
  "/user/information",
  authenticateToken_Middleware,
  body("gender")
    .notEmpty()
    .withMessage("Gender cannot be empty")
    .isIn(["male", "female"])
    .withMessage("Gender must be 'male' or 'female'"),
  body("biography").notEmpty().withMessage("Biography cannot be empty"),

  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors, " errors 13->>>.");
      return res.status(400).json("Please! complete all fields");
    }
    console.log("------------------------------=-------=-=-=-[123]");
    // const _user = authenticateToken(req);
    let _user = req.user;
    if (!_user) {
      console.log("User authentication failed");
      return res.status(401).json("UNAUTHORIZED");
    }

    console.log(_user, " ==================+++++++++++++++++++++101010");
    if (_user.username) {
      console.log(_user.setup_done, " user.setup_done");
      if (_user.setup_done == true) {
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
                username: _user.username,
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
      console.log("llllllllllllllllllllllllllll");
      await session.close();
      // req.session.user.setup_done = true;
      // await req.session.save();

      _user.setup_done = true;
      console.log("22222222222222222222222");

      const token = await generateAccessToken(_user);
      if (!token) {
        console.error("Failed to generate authentication token");
        return res.status(401).json({ error: "Authentication failed" });
      }
      console.log("4444444444444444444444444");

      res.cookie("jwt_token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 3600000, // 1 hour in milliseconds
      });
      console.log("5555555555555555555555");

      return res.status(200).json("User information route");
    }
    return res.status(401).json("UNAUTHORIZED");
  }
);

// // --------------------------------------

user_information_Router.post(
  "/user/settings",
  authenticateToken_Middleware,
  body("gender")
    .notEmpty()
    .withMessage("Gender cannot be empty")
    .isIn(["male", "female"])
    .withMessage("Gender must be 'male' or 'female'"),
  body("biography").notEmpty().withMessage("Biography cannot be empty"),

  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json("Please! complete all fields");

    const _user = req.user;
    console.log("------------------------------------------------------");
    console.log(_user, " 1");
    console.log("------------------------------------------------------");
    console.log(req.body.interests, " 2");
    console.log("------------------------------------------------------");
    console.log(req.body.gender, "3");
    console.log("------------------------------------------------------");

    if (_user.username) {
      console.log(_user.setup_done, " req.session.setup_done");
      if (_user.setup_done == true) {
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
      req.session.user.setup_done = true;
      await req.session.save();

      return res.status(200).json("User information route");
    }

    return res.status(401).json("Unauthorized");
  }
  //   }
);

// //----------------------------------------

// user_information_Router.get(
//   "/user/is_auth",
//   // authenticateToken,
//   async function (req: any, res: any) {
//     // console.log(await req.session.user);
//     // console.log(await req.session, " session");
//     console.log(req.user);
//     return res.status(200).json("f");
//   }
// );

user_information_Router.post(
  "/user/upload",
  authenticateToken_Middleware,
  async function (req: any, res: any) {
    // try {
    const _user = req.user;
    try {
      const files = await req.files; // Access all uploaded files

      console.log(files, "  -?files ");
      // console.log(Object.keys(files).length, "  -?count files-------------------------------------------------------------------- ")
      if (files) {
        // console.log(files[0], "  [0] ")
        // console.log(files.image_hna, "  [1] ")
        console.log(files.image_hna_0, "  [1] ");
        console.log(files.image_hna_1, "  [1] ");
        // console.log(files.image_hna_1, "  [1] ")
        const img_count = Object.keys(files).length;
        const session = driver.session(); // Open a Neo4j session
        let profilePictureSet = false;
        if (img_count <= 0) return res.status(400).json("NO images.");
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
      }
      return res.status(200).json("No files");
    } catch (error) {
      console.error("Image upload failed:", error);
      return res.status(400).json("Image upload failed.");
    }
  }
);

user_information_Router.get(
  "/user/info",
  authenticateToken_Middleware,
  async function (req: any, res: any) {
    try {
      const user = req.user;
      if (user) {
        console.log(
          user.username,
          " -----------------------------the user who is logged in now"
        );
        const session = driver.session();
        if (session) {
          // const res = await session.run('MATCH (n:User) WHERE n.username = $username  RETURN n',{username:user.username})
          const res_of_query = await session.run(
            "MATCH (n:User {username: $username})-[:onta_wla_dakar]->(g:Sex)  RETURN n, g",
            { username: user.username }
          );
          const res_interest = await session.run(
            "MATCH (n:User {username: $username})-[:has_this_interest]->(t:Tags)  RETURN  t",
            { username: user.username }
          );

          if (res_of_query && res_interest) {
            `[
  Node {
    identity: Integer { low: 5, high: 0 },
    labels: [ 'User' ],
    properties: {
      password: '41e513e66b9de648e514026a4a0e311deaba162b0c7ca460cd',
      verfication_token: '',
      setup_done: true,
      gender: '',
      verified: true,
      last_name: 'Tabiti',
      profile_picture: 'https://ik.imagekit.io/efcyow6m0/pexels-padrinan-2249528_uwVtgak-2.jpg',
      password_reset_token: '',
      biography: 'sddddddddddddddddddddddddddddddddddddddd sd s sdfew3323233 ',
      first_name: 'Anas',
      email: '...',
      username: 'atabiti'
    },
    elementId: '4:b4732734-2854-487c-93cc-b1c8f8f8c0b0:5'
  },
  Node {
    identity: Integer { low: 1, high: 0 },
    labels: [ 'Sex' ],
    properties: { gender: 'male' },
    elementId: '4:b4732734-2854-487c-93cc-b1c8f8f8c0b0:1'
  }
  ]`;
            const tags_interest = res_interest.records;
            let i = 0;
            let arr_ = [];
            while (res_interest.records[i] != null) {
              console.log(
                // res_interest.records[i]._fields[0].properties.interests,
                res_interest.records[i].get(0).properties.interests,

                " (- -) \n"
              );
              arr_.push(res_interest.records[i].get(0).properties.interests);
              // arr_.push(res_interest.records[i]._fields[0].properties.interests);
              i++;
            }
            console.log(
              arr_,
              "  arr_   ============================================="
            );
            const userNode = res_of_query.records[0].get(0).properties;
            const gender = res_of_query.records[0].get(1).properties.gender;
            // console.log(userNode, " --------- USER---------");
            // const userNode = res_of_query.records[0]._fields[0].properties;
            // const gender = res_of_query.records[0]._fields[1].properties.gender;
            // console.log(userNode, " --------- USER---------");
            // console.log(
            //   gender,
            //   " --------=========+++++ GENDER_---+++++========++++"
            // );
            const return_data = {
              username: userNode.username,
              profile_picture: userNode.profile_picture,
              last_name: userNode.last_name,
              "first_name:": userNode.first_name,
              "email:": userNode.email,
              "biography:": userNode.biography,
              gender: gender,
              tags: arr_,
            };
            // console.log(return_data, "--=---(- -)");
            return res.status(200).json(return_data);
          }
          return res.status(200).json("good");
        }
        return res.status(400).json("problem occured");
      }
      return res.status(400).json("user not found");
    } catch {
      return res.status(401).json("not authorized to access this api");
    }
  }
);

export default user_information_Router;
// tmpuser
//sklsdkKkd78*&KJ

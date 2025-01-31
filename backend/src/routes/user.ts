import express from "express";
import { body, ValidationError, validationResult } from "express-validator";
import neo4j from "neo4j-driver";
import { imagekitUploader } from "./../app";
import { authenticateToken_Middleware, generateAccessToken } from "./auth";

const user_information_Router = express.Router();
const driver = neo4j.driver(
  "neo4j://localhost:7687",
  neo4j.auth.basic(process.env.database_username as string, process.env.database_password as string)
);
user_information_Router.post(
  "/user/information",
  authenticateToken_Middleware,
  body("gender")
    .notEmpty()
    .withMessage("Gender cannot be empty")
    .isIn(["male", "female"])
    .withMessage("Gender must be 'male' or 'female'"),
  body("biography")
    .notEmpty()
    .withMessage("Biography cannot be empty")
    .isLength({ min: 20, max: 200 })
    .withMessage("Biography must be between 20 and 200 characters"),
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
        sameSite: "lax",
        maxAge: 3600000, // 1 hour in milliseconds
      });
      console.log("5555555555555555555555");

      return res.status(200).json("User information route");
    }
    return res.status(401).json("UNAUTHORIZED");
  }
);

// // --------------------------------------

//error handling ,parsing to be used in the other forms

user_information_Router.post(
  "/user/settings",
  authenticateToken_Middleware,
  body("last_name")
    .isLength({ min: 3, max: 30 })
    .notEmpty()
    .withMessage("last_name cannot be empty"),
  body("first_name")
    .isLength({ min: 3, max: 30 })
    .notEmpty()
    .withMessage("first_name cannot be empty"),
  body("email")
    .notEmpty()
    .isLength({ min: 7, max: 100 })
    .withMessage("email cannot be empty")
    .isEmail(),
  body("gender")
    .notEmpty()
    .withMessage("Gender cannot be empty")
    .isIn(["male", "female"])
    .withMessage("Gender must be 'male' or 'female'"),
  body("biography")
    .notEmpty()
    .withMessage("Biography cannot be empty")
    .isLength({ min: 20, max: 200 })
    .withMessage("Biography must be between 20 and 200 characters"),
  body("interests").isArray().withMessage("Interests must be an array"),

  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0] as any;
      return res.status(400).json(`Invalid : ${firstError.path}`);
    }

    const logged_user = req.user;
    console.log(logged_user.email, " >>>>>>>>>>>>-----------email is here-<<<<<<<<<<<");
    if (!logged_user) return res.status(401).json("UNAUTH");

    const user_copy = { ...req.body };
    const new_session = driver.session();
    console.log(logged_user, " logged_user\n\n\n\n\n");
    try {
      if (new_session) {
        const gender = req.body.gender;
        const email = req.body.email;
        console.log("NEW EMAIL IS : ", email, "\n\n\n");
        // Update basic user information
        const update_db = await new_session.run(
          `  
          MATCH (n:User)
          WHERE n.username = $username 
          SET n.last_name = $last_name,
              n.first_name = $first_name,
              n.gender = $gender,
              n.biography = $biography
          RETURN n
          `,
          {
            username: logged_user.username,
            last_name: user_copy.last_name,
            first_name: user_copy.first_name,
            gender: gender,
            biography: user_copy.biography,
          }
        );

        // Update gender relationship
        if (gender) {
          // Delete old gender relationship
          await new_session.run(
            `MATCH (u:User {username: $username})-[r:onta_wla_dakar]->(g:Sex)
             DELETE r`,
            { username: logged_user.username }
          );

          // Create new gender relationship
          await new_session.run(
            `MATCH (U:User) WHERE U.username = $username
             MATCH (G:Sex) WHERE G.gender = $gender
             MERGE (U)-[:onta_wla_dakar]->(G)`,
            { username: logged_user.username, gender: gender }
          );
        }

        // Update interests
        if (user_copy.interests && Array.isArray(user_copy.interests)) {
          // Delete old interests
          await new_session.run(
            `MATCH (u:User {username: $username})-[r:has_this_interest]->(t:Tags)
             DELETE r`,
            { username: logged_user.username }
          );

          // Create new interests
          for (const interest of user_copy.interests) {
            await new_session.run(
              `MATCH (u:User {username: $username})
               MERGE (t:Tags {interests: $interest})
               MERGE (u)-[:has_this_interest]->(t)`,
              {
                username: logged_user.username,
                interest: interest,
              }
            );
          }
        }

        if (update_db.records.length > 0) {
          return res.status(200).json("SUCCESS");
        } else {
          return res.status(400).json("Error updating user information");
        }
      } else {
        return res.status(400).json("Database session error");
      }
    } catch (error) {
      console.error("Error updating user settings:", error);
      return res.status(400).json("Error updating user settings");
    } finally {
      await new_session.close();
    }
  }
);
// user_information_Router.post(
//   "/user/settings",
//   authenticateToken_Middleware,
//   body("last_name").notEmpty().withMessage("last_name cannot be empty"),
//   body("first_name").notEmpty().withMessage("first_name cannot be empty"),
//   body("email").notEmpty().withMessage("email cannot be empty").isEmail(),
//   body("gender").notEmpty().withMessage("Gender cannot be empty").isIn(["male", "female"]).withMessage("Gender must be 'male' or 'female'"),
//   body("biography").notEmpty().withMessage("Biography cannot be empty"),

//   async (req: any, res: any) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       const firstError = errors.array()[0] as any;
//       // {
//       //   type: 'field',
//       //   value: 'atabitistudent.1337.ma',
//       //   msg: 'Invalid value',
//       //   path: 'email',
//       //   location: 'body'
//       // }
//       return res.status(400).json(`Invalid : ${firstError.path}`);
//     }

//     console.log(req.user, " user is ");
//     const logged_user = req.user;
//     if (!logged_user) return res.status(401).json("UNAUTH");
//     console.log(req.body, "\n");

//     //   last_name: 'Tabiti',
//     //   first_name: 'Anas',
//     //   email: 'atabiti@student.1337.ma',
//     //   gender: 'male',
//     //   biography: 'new day new me',
//     //   interests: [
//     //     '#42',          '#1337',
//     //     '#Swimming',    '#Shopping',
//     //     '#Yoga',        '#Cooking',
//     //     '#Art',         '#Video games',
//     //     '#Traveling',   '#Karaoke',
//     //     '#Photography'
//     //   ]
//     // }

//     const user_copy = { ...req.body };
//     console.log(user_copy, "user_copy\n");
//     const new_session = driver.session();
//     if (new_session) {
//       const gender = req.body.gender;
//       const update_db = await new_session.run(
//         `
//           MATCH (n:User)
//           WHERE n.username = $username
//           SET n.last_name = $last_name,
//               n.first_name = $first_name,
//               n.gender = $gender,
//               n.biography = $biography
//           RETURN n
//           `,
//         { username: logged_user.username, last_name: user_copy.last_name, first_name: user_copy.first_name, gender: gender, biography: user_copy.biography }
//       );
//       if (gender) {
//         //delete old gender
//         await new_session.run(
//           `MATCH (u:User {username: $username})-[r:onta_wla_dakar]->(g:Sex)
//             DELETE r`,
//           { username: logged_user.username }
//         );

//         await new_session.run(
//           `MATCH (U:User) WHERE U.username = $username
//             MATCH (G:Sex) WHERE G.gender = $gender
//             MERGE (U)-[:onta_wla_dakar]->(G)

//   `,

//           { username: logged_user.username, gender: gender }
//         );
//       }
//       if (update_db.records.length > 0) return res.status(200).json("SUCESS");
//       else return res.status(400).json("Error");
//     } else {
//       return res.status(400).json("Error DB");
//     }
//   }
// );

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
    const _user = req.user;
    try {
      const files = await req.files; // Access all uploaded files
      if (files) {
      const session = driver.session(); // Open a Neo4j session
      console.log(Object.keys(files), "------console.log(Object.keys(files))-------");
      const keys: string[] = Object.keys(files);
      console.log(files, "  -?files ");
      for (let i = 0; i < keys.length; i++) {
        console.log(keys[i], " key--", files[keys[i]], "=============---====(-`-)");
      
       
        let profilePictureSet = false;
       
          const file = files[keys[i]]
          const img_db_index = keys[i].replace("image_hna_", ""); 
          console.log(img_db_index, " image index\n\n\n\n\n\n\n") ; // Output: "2"
          // Upload to ImageKit
          const ret = await imagekitUploader.upload({
            file: file.data,
            fileName: file.name,
          });
          // console.log(ret, "<- Uploaded file response");

          if (!profilePictureSet && keys[i] == 'image_hna_0') {
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
             SET u.pic_${img_db_index} = $url
             RETURN u`,
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

      console.log("-------------------------------", user, "\n\n\n\n\n");
      if (user.setup_done == false) return res.status(405).json("Complete Profile Setup first");
      // console.log(req, " req is here");
      console.log("-------------------------------");
      if (user) {
        console.log(user.username, " -----------------------------the user who is logged in now");
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
          console.log(res_of_query, "++++++++++++++++++++++++++=res_of_query");
          console.log(res_interest, " -------------res_interest");
          if (res_of_query.records.length > 0 && res_interest.records.length > 0) {
            console.log("here");
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
            console.log(arr_, "  arr_   =============================================");
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
            // const return_data = {
            //   username: userNode.username,
            //   profile_picture: userNode.profile_picture,
            //   last_name: userNode.last_name,
            //   "first_name:": userNode.first_name,
            //   "email:": userNode.email,
            //   "biography:": userNode.biography,
            //   gender: gender,
            //   tags: arr_,
            // };
            const return_data = {
              username: userNode.username,
              profile_picture: userNode.profile_picture,
              last_name: userNode.last_name,
              "first_name:": userNode.first_name,
              "email:": userNode.email,
              "biography:": userNode.biography,
              pic_1: userNode.pic_1,

              pic_2: userNode.pic_2,

              pic_3: userNode.pic_3,

              pic_4: userNode.pic_4,
              gender: gender,
              tags: arr_,
            };
            // console.log(return_data, "--=---(- -)");
            return res.status(200).json(return_data);
          }
          return res.status(400).json("user infos are not completed");
        }
        return res.status(400).json("problem occured");
      }
      return res.status(400).json("user not found");
    } catch {
      return res.status(400).json("Error occured");
    }
  }
);

export default user_information_Router;
// tmpuser
//sklsdkKkd78*&KJ

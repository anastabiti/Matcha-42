import express, { Request, Response } from "express";
import neo4j from "neo4j-driver";
// import { imagekitUploader } from "./../app";
import { authenticateToken_Middleware, generateAccessToken } from "./auth";
import { v2 as cloudinary } from 'cloudinary';
import { driver } from "../database";
import { validateAge, validateBiography, validateEmail, validateGender, validateInterests, validateName } from "../validators/validate";

const user_information_Router = express.Router();

export type UserJWTPayload = {
  username: string;
  email: string;
  setup_done: boolean;
  /** Issued At timestamp (in seconds since Unix epoch) */
  iat: number;
  /** Expiration timestamp (in seconds since Unix epoch) */
  exp: number;
};

user_information_Router.post(
  "/user/information",
  authenticateToken_Middleware,
  validateAge,validateBiography,validateGender,
  async (req: any, res: any) => {
    
    

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
                        set n.gender = $gender
                        set n.age = $age
                        RETURN n.username
              `,
            {
              username: _user.username,
              biography: req.body.biography,
              gender: req.body.gender,
              age: req.body.age,
            }
          );
        }
        //     if (await req.body.gender) {
        //       //delete old gender
        //       await session.run(
        //         `MATCH (u:User {username: $username})-[r:onta_wla_dakar]->(g:Sex)
        //           DELETE r`,
        //         { username: _user.username }
        //       );

        //       await session.run(
        //         `MATCH (U:User) WHERE U.username = $username
        //           MATCH (G:Sex) WHERE G.gender = $gender
        //           MERGE (U)-[:onta_wla_dakar]->(G)

        // `,

        //         { username: _user.username, gender: await req.body.gender }
        //       );
        //     }
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

// --------------------------------------


user_information_Router.post(
  "/user/settings",
  authenticateToken_Middleware,
  validateName,validateEmail,validateGender,validateBiography,validateAge,validateInterests,

  async (req: any, res: any) => {
   
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
              n.biography = $biography,
              n.age = $age
          RETURN n
          `,
          {
            username: logged_user.username,
            last_name: user_copy.last_name,
            first_name: user_copy.first_name,
            gender: gender,
            biography: user_copy.biography,
            age: user_copy.age,
          }
        );

        // // Update gender relationship
        // if (gender) {
        //   // Delete old gender relationship
        //   await new_session.run(
        //     `MATCH (u:User {username: $username})-[r:onta_wla_dakar]->(g:Sex)
        //      DELETE r`,
        //     { username: logged_user.username }
        //   );

        //   // Create new gender relationship
        //   await new_session.run(
        //     `MATCH (U:User) WHERE U.username = $username
        //      MATCH (G:Sex) WHERE G.gender = $gender
        //      MERGE (U)-[:onta_wla_dakar]->(G)`,
        //     { username: logged_user.username, gender: gender }
        //   );
        // }

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

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

user_information_Router.post(
  "/user/upload",
  authenticateToken_Middleware,
  async function (req: any, res: any) {
    const _user = req.user;
    try {
      const files = await req.files;
      if (!files) {
        return res.status(200).json("No files");
      }

      const session = driver.session();
      const keys: string[] = Object.keys(files);

      // Get existing pics array
      const result = await session.run(
        `MATCH (u:User {username: $username}) 
         RETURN u.pics as pics`,
        { username: _user.username }
      );
      let existingPics = result.records[0]?.get("pics") || [];
      console.log();
      for (let i = 0; i < keys.length; i++) {
        const file = files[keys[i]];
        console.log(
          "[",
          files[keys[i]],
          " ----------files[keys[i]];\n",
          keys[i],
          "\n\n\n",
          files,
          " ---files",
          " i is ",
          i,
          "\n\n\n\n\n\n\n keys.length ",
          keys.length,
          "]\n\n\n"
        );
        let index = Number(keys[i]);
        console.log(
          typeof keys[i],
          " typeof(keys[i])\n\n",
          keys[i],
          " keys[i]\n",
          typeof index,
          " typeof(index)\n"
        );
        // Validate mime type
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return res.status(400).json({
            success: false,
            message: `Invalid file type: ${file.mimetype}. Only JPEG/JPG and PNG files are allowed.`,
          });
        }

        // // Upload to ImageKit
        // const ret = await imagekitUploader.upload({
        //   file: file.data,
        //   fileName: file.name,
        // });

        // Upload an image
        console.log('Processing file:', file); // Debug log
        console.log('Processing file:', file[0]); // Debug log

        //create  a data URI scheme
        const uploadResult = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.data.toString('base64')}`, {
        })

          .catch((error) => {
            console.log(error);
          });
          console.log(uploadResult?.url,  "------uploadResult--------")

        // Handle profile picture (first image)
        if (index === 0) {
          existingPics[index] = uploadResult?.url;
          await session.run(
            `MATCH (u:User {username: $username})
              SET u.profile_picture = $profile_picture
             RETURN u`,
            { username: _user.username, profile_picture: uploadResult?.url }
          );
        }

        existingPics[index] = uploadResult?.url;
      }

      // Update the pics array in the database
      await session.run(
        `MATCH (u:User {username: $username})
         SET u.pics = $pics
         RETURN u`,
        { username: _user.username, pics: existingPics }
      );

      session.close();
      return res.status(200).json("Images uploaded successfully.");
    } catch (error) {
      console.error("Image upload failed:", error);
      return res.status(400).json("Image upload failed.");
    }
  }
);
user_information_Router.get(
  "/user/is_logged",
  authenticateToken_Middleware,
  async function (req: any, res: any) {
    console.log("is_looged is called ");
    return res.status(200).json("IS LOGGED");
  }
);

// -------------
user_information_Router.get(
  "/user/info",
  authenticateToken_Middleware,
  async function (req: any, res: any) {
    try {
      const user = req.user;

      if (user.setup_done == false) return res.status(405).json("Complete Profile Setup first");
      // console.log(req, " req is here");
      if (user) {
        // console.log(user.username, " -----------------------------the user who is logged in now");
        const session = driver.session();
        if (session) {
          const res_of_query = await session.run(
            "MATCH (n:User) WHERE n.username = $username  RETURN n",
            { username: user.username }
          );
          // const res_of_query = await session.run(
          //   "MATCH (n:User {username: $username})-[:onta_wla_dakar]->(g:Sex)  RETURN n, g",
          //   { username: user.username }
          // );
          const res_interest = await session.run(
            "MATCH (n:User {username: $username})-[:has_this_interest]->(t:Tags)  RETURN  t",
            { username: user.username }
          );
          if (res_of_query.records.length > 0 && res_interest.records.length > 0) {
            console.log("here");
            const tags_interest = res_interest.records;
            let i = 0;
            let arr_ = [];
            while (res_interest.records[i] != null) {
              // console.log(
              //   // res_interest.records[i]._fields[0].properties.interests,
              //   res_interest.records[i].get(0).properties.interests,

              //   " (- -) \n"
              // );
              arr_.push(res_interest.records[i].get(0).properties.interests);
              i++;
            }
            // console.log(arr_, "  arr_   =============================================");
            const userNode = res_of_query.records[0].get(0).properties;

            const return_data = {
              username: userNode.username,
              profile_picture: userNode.profile_picture,
              last_name: userNode.last_name,
              "first_name:": userNode.first_name,
              "email:": userNode.email,
              "biography:": userNode.biography,
              pics: userNode.pics || [],
              gender: userNode.gender,
              age: userNode.age,
              tags: arr_,
            };
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

const axios = require("axios");

user_information_Router.post(
  "/location",
  authenticateToken_Middleware,
  async function (req: Request, res: Response) {
    // try {
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;

    const user: any = req.user;
    console.log(user, "  user");
    if (latitude && longitude && user) {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            "Accept-Language": "en", //city we country names in english better
          },
        }
      );
      console.log(response.data, " -----------------------------data\n\n\n\n");

      const cityName = (await response.data.address.city.split(" ")[0]) || "Unknown City"; //  city: 'Khouribga ⵅⵯⵔⵉⴱⴳⴰ خريبكة',
      const country = response.data.address.country.split(" ")[0] || "NA"; // country: 'Maroc ⵍⵎⵖⵔⵉⴱ المغرب',

      const db_session = driver.session();
      if (db_session) {
        // https://neo4j.com/docs/cypher-manual/current/values-and-types/spatial/
        const result = await db_session.run(
          `
            MATCH (n:User) WHERE n.username = $username
            SET   n.location = point({latitude: $latitude, longitude: $longitude}),
            n.city = $cityName, n.country = $country_name
        
            RETURN n
            
            `,
          {
            username: user.username,
            latitude: latitude,
            longitude: longitude,
            cityName: cityName,
            country_name: country,
          }
        );
        console.log(req.body);
        res.status(200).json("location saved");
        return;
      }
      res.status(400).json("error in db session");
      return;
    } else {
      res.status(400).json("Cannot access location");
      return;
    }
    // } catch {}
  }
);

user_information_Router.post(
  "/location/WTK",
  authenticateToken_Middleware,
  async function (req: Request, res: Response) {
    const response = await axios.get("http://api.ipify.org");
    console.log(response.data, " , -------res");

    const pub_ip = response.data;

    const url = `https://apiip.net/api/check?ip=${pub_ip}&accessKey=${process.env.ip_finder_pub}`;
    const responses = await axios.get(url);
    const result = responses.data;
    console.log(result, "sssss---------------result");

    // {
    //   ip: 'hhhhhh'
    //   continentCode: 'AF',
    //   continentName: 'Africa',
    //   countryCode: 'MA',
    //   countryName: 'Morocco',
    //   countryNameNative: 'المغرب',
    //   officialCountryName: 'Kingdom of Morocco',
    //   regionCode: '05',
    //   regionName: 'Béni Mellal-Khénifra',
    //   cityGeoNameId: 2544248,
    //   city: 'Khouribga',
    //   cityWOSC: 'Khouribga',
    //   latitude: 32.8804,
    //   longitude: -6.9057,
    //   capital: 'Rabat',
    //   phoneCode: '212',
    //   countryFlagEmoj: '🇲🇦',
    //   countryFlagEmojUnicode: 'U+1F1F2 U+1F1E6',
    //   isEu: false,
    //   borders: [ 'DZA', 'ESH', 'ESP' ],
    //   topLevelDomains: [ '.ma', 'المغرب.' ]
    // }

    const latitude = result.latitude;
    const longitude = result.longitude;

    const user: any = req.user;

    if (user) {
      const cityName = result.city;

      const country = result.countryName;

      const db_session = driver.session();
      if (db_session) {
        // https://neo4j.com/docs/cypher-manual/current/values-and-types/spatial/
        const result = await db_session.run(
          `
            MATCH (n:User) WHERE n.username = $username
            SET   n.location_WTK = point({latitude: $latitude_WTK, longitude: $longitude_WTK}),
            n.city_WTK = $cityName_WTK, n.country_WTK = $country_name_WTK

            RETURN n

            `,
          {
            username: user.username,
            latitude_WTK: latitude,
            longitude_WTK: longitude,
            cityName_WTK: cityName,
            country_name_WTK: country,
          }
        );
        console.log(req.body);
        res.status(200).json("location saved");
        return;
      }
      res.status(400).json("error in db session");
      return;
    } else {
      res.status(400).json("Cannot access location");
      return;
    }
  }
);

export default user_information_Router;
// tmpuser
//sklsdkKkd78*&KJ

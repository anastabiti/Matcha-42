import express, { response } from "express";
// import { driver, Driver } from 'neo4j-driver';
import neo4j, { int } from "neo4j-driver";
import { authenticateToken_Middleware } from "./auth";
import { getSocketIO } from "../socket";
// import app from "../app";

const match = express.Router();

const driver = neo4j.driver(
  "neo4j://localhost:7687",
  neo4j.auth.basic(process.env.database_username as string, process.env.database_password as string)
);

match.get("/matches", authenticateToken_Middleware, async (req: any, res: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const session = driver.session();
  try {
    const result = await session.run(
      `
          MATCH (u:User {username: $username})
          MATCH (otherUser:User)
          WHERE (u)-[:MATCHED]-(otherUser)
          RETURN otherUser
          `,
      { username: req.user.username }
    );

    const matches = result.records.map((record) => {
      const user = record.get("otherUser");
      return {
        id: user.identity.low,
        username: user.properties.username,
        name: `${user.properties.first_name} ${user.properties.last_name}`,
        age: user.properties.age,
        // distance: ,
        profile_picture: user.properties.pics.slice(0, 1),
        preview: {
          bio: user.properties.biography.substring(0, 100) + "...",
        },
        interests: user.properties.interests,
        isOnline: true,
      };
    });

    return res.status(200).json({
      success: true,
      data: matches,
      count: matches.length,
    });
  } catch (error) {
  } finally {
    await session.close();
  }
});

match.post("/like-user", authenticateToken_Middleware, async (req: any, res: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = req.user;
  const username = user.username;
  const { likedUsername } = req.body;

  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {username: $username})
      MATCH (otherUser:User {username: $likedUsername})
      WHERE u <> otherUser
      MERGE (u)-[r:LIKES {createdAt: datetime()}]->(otherUser)
      WITH u, otherUser, EXISTS((otherUser)-[:LIKES]->(u)) as isMatch
      
      FOREACH(x IN CASE WHEN isMatch THEN [1] ELSE [] END |
          MERGE (u)-[m:MATCHED {createdAt: datetime()}]-(otherUser)
      )
      
      RETURN {
          liked: true, 
          isMatch: isMatch,
          matchedAt: CASE WHEN isMatch THEN datetime() ELSE null END
      } as result`,
      { username, likedUsername }
    );

 ;

    if (result.records.length > 0) {
         /*----------------------------------------------------- Notifications by atabiti-----------------------------------------------------------------------------*/
         

         const query = `
         MATCH (user:User {username: $username})
         CREATE (n:Notification {
           notify_id: randomUUID(),
           fromUsername: $fromUsername,
           type: $type,
           content: $content,
           createdAt: date(),
           isRead: false
         })
         CREATE (user)-[:YOU_HAVE_A_NOTIFICATION]->(n)
         RETURN n
       `;
 
       const notificationArray = (`User ${username} liked you!`);
       const result = await session.run(query, {
        fromUsername:username,
        username:likedUsername,
         type:"Liked",
         content:notificationArray
       });

       const notification = result.records[0].get('n').properties;
       getSocketIO().to(likedUsername).emit("notification", notification);

          /*----------------------------------------------------- Notifications by atabiti-----------------------------------------------------------------------------*/
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ error: "Failed to like user" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await session.close();
  }
});

export default match;

match.post("/potential-matches", authenticateToken_Middleware, async (req: any, res: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Parse and validate numeric inputs
  const {
    minAge = 18,
    maxAge = 100,
    minCommonTags = 0,
    filterTags = [],
    minFame = 0,
    maxFame = 100,
    sortBy = "age",
    page = 1,
    limit = 10,
  } = req.body;

  // Ensure all numeric values are integers
  const params = {
    username: req.user.username,
    minAge: Math.floor(Number(minAge)),
    maxAge: Math.floor(Number(maxAge)),
    minCommonTags: Math.floor(Number(minCommonTags)),
    filterTags: Array.isArray(filterTags) ? filterTags : [],
    minFame: Math.floor(Number(minFame)),
    maxFame: Math.floor(Number(maxFame)),
    sortBy: String(sortBy),
    skip: Math.max(0, Math.floor(Number(page) - 1)) * Math.floor(Number(limit)),
    limit: Math.floor(Number(limit)),
  };

  if (params.minAge < 18 || params.maxAge > 100 || params.minAge > params.maxAge) {
    return res.status(400).json({ error: "Invalid age range" });
  }

  if (params.minFame < 0 || params.maxFame > 100 || params.minFame > params.maxFame) {
    return res.status(400).json({ error: "Invalid fame range" });
  }

  if (params.limit <= 0 || params.limit > 50) {
    params.limit = 10;
  }

  const query = `
    MATCH (u:User {username: $username})
    MATCH (otherUser:User)
    WHERE otherUser.username <> u.username 
    AND otherUser.gender <> u.gender
    AND otherUser.age >= $minAge 
    AND otherUser.age <= $maxAge
    AND otherUser.fame_rating >= $minFame
    AND otherUser.fame_rating <= $maxFame
    AND NOT (u)-[:LIKES]->(otherUser)
    AND NOT (u)-[:BLOCKED]->(otherUser)

    OPTIONAL MATCH (otherUser)-[r:has_this_interest]->(t:Tags)
    WITH otherUser, u, COLLECT(DISTINCT t.interests) as otherUserInterests

    OPTIONAL MATCH (u)-[:has_this_interest]->(userTags:Tags)
    WHERE userTags.interests IN otherUserInterests

    WITH otherUser,
         otherUserInterests as interests,
         COUNT(DISTINCT userTags) as commonTags

    WHERE
        CASE
            WHEN $minCommonTags > 0 THEN commonTags >= $minCommonTags
            ELSE true
        END
    AND
        CASE
            WHEN size($filterTags) > 0 THEN
                ANY(tag IN interests WHERE tag IN $filterTags)
            ELSE true
        END

    RETURN
        otherUser,
        interests,
        commonTags,
        otherUser.age as age,
        otherUser.fame_rating as fameRating

    ORDER BY
        CASE $sortBy
            WHEN 'age' THEN otherUser.age
            WHEN 'fame' THEN otherUser.fame_rating
            WHEN 'common_tags' THEN commonTags
            ELSE otherUser.fame_rating
        END DESC
    
    SKIP toInteger($skip)
    LIMIT toInteger($limit)
  `;

  const session = driver.session();
  try {
    const result = await session.run(query, params);

    const profiles = result.records.map((record) => {
      const user = record.get("otherUser");
      const interests = record.get("interests");
      const commonTags = record.get("commonTags").low;

      // Return limited information for card view
      return {
        id: user.identity.low,
        username: user.properties.username,
        name: `${user.properties.first_name} ${user.properties.last_name}`,
        age: user.properties.age,
        distance: user.properties.distance,
        pics: user.properties.pics.slice(0, 1), // Only return first picture for card view
        preview: {
          interests: interests.slice(0, 3), // Only first 3 interests
          bio: user.properties.biography.substring(0, 100) + "...", // Truncated bio
        },
      };
    });

    return res.status(200).json({
      success: true,
      data: profiles,
      count: profiles.length,
      pagination: {
        page: Math.floor(Number(page)),
        limit: params.limit,
        hasMore: profiles.length === params.limit,
      },
    });
  } catch (error) {
    console.error("Error in potential-matches:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await session.close();
  }
});

match.get("/profile/:username", authenticateToken_Middleware, async (req: any, res: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const username = req.params.username;
  console.log("you viewed ",username , " Profile")




  const session = driver.session();

  try {
    const query = `
          MATCH (user:User {username: $username})
          OPTIONAL MATCH (user)-[:has_this_interest]->(t:Tags)
          WITH user, COLLECT(DISTINCT t.interests) as interests
          
          // Calculate profile completeness
          WITH user, interests,
               CASE 
                  WHEN user.profile_picture IS NOT NULL THEN 20 ELSE 0 END +
                  CASE WHEN user.biography IS NOT NULL AND size(user.biography) > 50 THEN 20 ELSE 0 END +
                  CASE WHEN size(interests) > 2 THEN 20 ELSE 0 END +
                  CASE WHEN user.occupation IS NOT NULL THEN 20 ELSE 0 END +
                  CASE WHEN user.location IS NOT NULL THEN 20 ELSE 0 END as profile_completeness
          
          RETURN user, 
                 interests,
                 profile_completeness,
                 user.points as points,
                 user.fame_rating as fame_rating
      `;

    const result = await session.run(query, { username });

    if (result.records.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }



         /*----------------------------------------------------- Notifications by atabiti-----------------------------------------------------------------------------*/
          
       const notificationArray = (`${username} viewed your profile!`);
       const result_ = await session.run(`
         MATCH (user:User {username: $username})
         CREATE (n:Notification {
           notify_id: randomUUID(),
           fromUsername: $fromUsername,
           type: $type,
           content: $content,
           createdAt: date(),
           isRead: false
         })
         CREATE (user)-[:YOU_HAVE_A_NOTIFICATION]->(n)
         RETURN n
       `, {
        fromUsername:req.user.username,
        username:username,
         type:"Liked",
         content:notificationArray
       });

       const notification = result_.records[0].get('n').properties;
       getSocketIO().to(username).emit("notification", notification);

          /*----------------------------------------------------- Notifications by atabiti-----------------------------------------------------------------------------*/

    const record = result.records[0];
    const user = record.get("user");
    const interests = record.get("interests");
    const profile_completeness = record.get("profile_completeness").low;
    const points = record.get("points")?.low || 0;
    const fame_rating = record.get("fame_rating")?.low || 0;

    return res.status(200).json({
      success: true,
      data: {
        username: user.properties.username,
        first_name: user.properties.first_name,
        last_name: user.properties.last_name,
        age: user.properties.age,
        gender: user.properties.gender,
        biography: user.properties.biography,
        location: user.properties.location,
        distance: user.properties.distance,
        profile_picture: user.properties.profile_picture,
        pics: user.properties.pics,
        interests: interests,
        fame_rating: fame_rating,
        city: user.properties.city,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await session.close();
  }
});

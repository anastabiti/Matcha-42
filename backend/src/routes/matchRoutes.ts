import express, { response } from "express";
// import { driver, Driver } from 'neo4j-driver';
import neo4j, { int, Record } from "neo4j-driver";
import { authenticateToken_Middleware } from "./auth";
import { getSocketIO } from "../socket";
import { driver } from "../database";


const match = express.Router();



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

      const matches = result.records.map((record:Record) => {
          const user = record.get("otherUser");
          return {
              id: user.identity.low,
              username: user.properties.username,
              name: `${user.properties.first_name} ${user.properties.last_name}`,
              age: user.properties.age,
              // distance: ,
              profile_picture: user.properties.pics.slice(0, 1),
              preview: {
                  bio: user.properties.biography.substring(0, 100) + "..."
              },
              interests: user.properties.interests,
              isOnline: true,
          };
      });

      return res.status(200).json({
          success: true,
          data: matches,
          count: matches.length
      });

  } catch (error) {}
  finally {
      await session.close();
  }
});


match.post("/potential-matches", authenticateToken_Middleware, async (req: any, res: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    minAge = 18,
    maxAge = 100,
    minCommonTags = 0,
    filterTags = [],
    minFame = 0,
    maxFame = 100,
    maxDistance = 100,
    sortBy = 'distance',
    page = 1,
    limit = 10
  } = req.body;

  const params = {
    username: req.user.username,
    minAge: Math.floor(Number(minAge)),
    maxAge: Math.floor(Number(maxAge)),
    minCommonTags: Math.floor(Number(minCommonTags)),
    filterTags: Array.isArray(filterTags) ? filterTags : [],
    minFame: Math.floor(Number(minFame)),
    maxFame: Math.floor(Number(maxFame)),
    maxDistance: Math.floor(Number(maxDistance)),
    sortBy: String(sortBy),
    skip: Math.max(0, Math.floor(Number(page) - 1)) * Math.floor(Number(limit)),
    limit: Math.floor(Number(limit))
  };

  // Validation checks
  if (params.minAge < 18 || params.maxAge > 100 || params.minAge > params.maxAge) {
    return res.status(400).json({ error: "Invalid age range" });
  }

  if (params.minFame < 0 || params.maxFame > 100 || params.minFame > params.maxFame) {
    return res.status(400).json({ error: "Invalid fame range" });
  }

  if (params.maxDistance < 0 || params.maxDistance > 20000) { // 20000km is roughly half Earth's circumference
    return res.status(400).json({ error: "Invalid distance range" });
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

  // Calculate distance between users using point distance
  WITH u, otherUser,
       point.distance(u.location_WTK, otherUser.location_WTK) / 1000 as distance // Convert to kilometers

  WHERE distance <= $maxDistance

  OPTIONAL MATCH (otherUser)-[r:has_this_interest]->(t:Tags)
  WITH otherUser, u, distance, COLLECT(DISTINCT t.interests) as otherUserInterests

  OPTIONAL MATCH (u)-[:has_this_interest]->(userTags:Tags)
  WHERE userTags.interests IN otherUserInterests

  WITH otherUser,
       otherUserInterests as interests,
       COUNT(DISTINCT userTags) as commonTags,
       distance

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
      distance,
      otherUser.age as age,
      otherUser.fame_rating as fameRating

  ORDER BY
      CASE $sortBy
          WHEN 'common_tags' THEN -commonTags  // Using negative to reverse the sort order for common tags
          WHEN 'distance' THEN distance
          WHEN 'age' THEN otherUser.age
          WHEN 'fame' THEN otherUser.fame_rating
          ELSE distance
      END ASC
  
  SKIP toInteger($skip)
  LIMIT toInteger($limit)
`;

  const session = driver.session();
  try {
    const result = await session.run(query, params);

    const profiles = result.records.map((record:  Record) => {
      const user = record.get("otherUser");
      const interests = record.get("interests");
      const commonTags = record.get("commonTags").low;
      const distance = Math.round(record.get("distance"));

      return {
        id: user.identity.low,
        username: user.properties.username,
        name: `${user.properties.first_name} ${user.properties.last_name}`,
        age: user.properties.age,
        distance: distance,
        pics: user.properties.pics.slice(0, 1),
        commonTags: commonTags,
        preview: {
          interests: interests.slice(0, 3),
          bio: user.properties.biography.substring(0, 100) + "..."
        }
      };
    });

    return res.status(200).json({
      success: true,
      data: profiles,
      count: profiles.length,
      pagination: {
        page: Math.floor(Number(page)),
        limit: params.limit,
        hasMore: profiles.length === params.limit
      }
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
  const user = req.user.username;
  const session = driver.session();

  try {
    const query = `
    MATCH (user:User {username: $username})
    OPTIONAL MATCH (user)-[:has_this_interest]->(t:Tags)
    WITH user, COLLECT(DISTINCT t.interests) as interests
    
    RETURN user, 
           interests,
           user.points as points,
           user.fame_rating as fame_rating
`;

      const result = await session.run(query, { username });
      
      if (result.records.length === 0) {
          return res.status(404).json({ error: "Profile not found" });
      }

      const record = result.records[0];
      const user = record.get("user");
      const interests = record.get("interests");
      const fame_rating = record.get("fame_rating")?.low || 0;

      if(req.user.username !== username)
        {

          const notificationArray = `${req.user.username} viewed your profile!`;
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
           RETURN n`
           , {
             fromUsername:req.user.username,
             username:username,
             type:"Liked",
             content:notificationArray
            });

            const notification = result_.records[0].get('n').properties;
            getSocketIO().to(username).emit("notification", notification);
          }
          

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
          }
      });
  } catch (error) {
      console.error("Error fetching profile:", error);
      return res.status(500).json({ error: "Internal Server Error" });
  } finally {
      await session.close();
  }
});

match.get("/connection-status/:username", authenticateToken_Middleware, async (req: any, res: any) => {
    const targetUsername = req.params.username;
    const currentUsername = req.user.username;
    const session = driver.session();

    try {
        const query = `
        MATCH (current:User {username: $currentUsername})
        MATCH (target:User {username: $targetUsername})
        RETURN 
            EXISTS((current)-[:LIKES]->(target)) as isLiked,
            CASE 
                WHEN EXISTS((current)-[:LIKES]->(target)) AND EXISTS((target)-[:LIKES]->(current))
                THEN true 
                ELSE false 
            END as isMatched
        `;

        const result = await session.run(query, { 
            currentUsername,
            targetUsername
        });

        const record = result.records[0];
        
        return res.json({
            success: true,
            isLiked: record.get('isLiked'),
            isMatched: record.get('isMatched')
        });
    } catch (error) {
        console.error("Error checking connection status:", error);
        return res.status(500).json({ 
            success: false, 
            error: "Internal Server Error" 
        });
    } finally {
        await session.close();
    }
});


export default match;
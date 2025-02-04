import express, { response } from "express";
// import { driver, Driver } from 'neo4j-driver';
import neo4j from "neo4j-driver";
import { authenticateToken_Middleware } from "./auth";
import { count } from "console";

const match = express.Router();

const driver = neo4j.driver(
  "neo4j://localhost:7687",
  neo4j.auth.basic(process.env.database_username as string, process.env.database_password as string)
);

match.post("/potential-matches", authenticateToken_Middleware, async (req: any, res: any) => {
  console.log("potential-matches");
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = req.user;

  const username = user.username;
  console.log("username", username);
  const query = `MATCH (u:User {username: $username})
  MATCH (otherUser:User)
  WHERE otherUser.username <> u.username 
  AND otherUser.gender <> u.gender
  AND otherUser.age >= $minAge 
  AND otherUser.age <= $maxAge
  
  // Fame rating gap filter
  AND otherUser.fame_rating >= $minFame
  AND otherUser.fame_rating <= $maxFame
  
  // Get matching interests
  OPTIONAL MATCH (otherUser)-[r:has_this_interest]->(t:Tags)
  WITH otherUser, u, COLLECT(DISTINCT t.interests) as otherUserInterests
  
  OPTIONAL MATCH (u)-[:has_this_interest]->(userTags:Tags)
  WHERE userTags.interests IN otherUserInterests
  
  // Calculate matches and group results
  WITH otherUser,
       otherUserInterests as interests,
       COUNT(DISTINCT userTags) as commonTags
  
  // Filter by minimum common tags if specified
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
  
  // Dynamic sorting
  ORDER BY 
      CASE $sortBy
          WHEN 'age' THEN otherUser.age
          WHEN 'fame' THEN otherUser.fame_rating
          WHEN 'common_tags' THEN commonTags
          ELSE otherUser.fame_rating
      END DESC`;

  const session = driver.session();
  try {
    const result = await session.run(query, {
      username: username,
      minAge: 18,
      maxAge: 100,
      minCommonTags: 0,
      filterTags: [],
      minFame: 0,
      maxFame: 100,
      sortBy: "age", // 'age', 'fame', 'common_tags'
    });

    const node = result.records.map((record) => {
      const user = record.get("otherUser");
      const interests = record.get("interests");
      const commonTags = record.get("commonTags").low;

      console.log("tesst", user);

      return {
        id: user.identity.low,
        fame_rating: user.properties.fame_rating.low,
        gender: user.properties.gender,
        username: user.properties.username,
        name: `${user.properties.first_name} ${user.properties.last_name}`,
        interests: interests,
        common_interests: commonTags,
        bio: user.properties.biography,
        age: user.properties.age,
        pics: user.properties.pics,
        fameRating: user.properties.fame_rating.low,
        distance: 500,
      };
    });

    return res.status(200).json({
      success: true,
      data: node,
      count: node.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // console.log(result);
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
      `MATCH (u:User {username: $username})
      MATCH (otherUser:User {username: $likedUsername})
      WHERE u <> otherUser
      MERGE (u)-[r:LIKES {createdAt: datetime()}]->(otherUser)
      WITH u, otherUser, EXISTS((otherUser)-[:LIKES]->(u)) as isMatch
      FOREACH(x IN CASE WHEN isMatch THEN [1] ELSE [] END |
        MERGE (u)-[m:MATCHED {createdAt: datetime()}]->(otherUser)
        MERGE (otherUser)-[:MATCHED {createdAt: datetime()}]->(u)
      )
      RETURN {liked: true, isMatch: isMatch} as result`,
      { username, likedUsername }
    );

    if (result.records.length > 0) {
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

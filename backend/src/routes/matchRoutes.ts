import express, { response } from "express";
// import { driver, Driver } from 'neo4j-driver';
import neo4j from "neo4j-driver";
import { authenticateToken_Middleware } from "./auth";

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

  const session = driver.session();
  try {
    const result = await session.run(
        `MATCH (u:User {username: $username})-[r:onta_wla_dakar]->(s:Sex)
         WITH u, s.gender as userGender
         MATCH (otherUser:User)-[:onta_wla_dakar]->(otherSex:Sex)
         WHERE otherUser.username <> u.username 
         AND ((userGender = 'male' AND otherSex.gender = 'female') 
              OR (userGender = 'female' AND otherSex.gender = 'male'))
         OPTIONAL MATCH (otherUser)-[r:has_this_interest]->(t:Tags)
         RETURN otherUser,
                otherSex.gender as gender,
                COLLECT(DISTINCT t.interests) as interests`,
        { username: username }
    );
	 
	//  const nodes = result.records.map(record => {
	// 	const node = record.get('u');
	// 	return {
	// 	  id: node.identity.low,
	// 	  labels: node.labels,
	// 	  properties: node.properties
	// 	};
	//   });

	const nodes = result.records.map(record => {
        const user = record.get('otherUser');
        const interests = record.get('interests');
        return {
            id: user.identity.low,
            username: user.properties.username,
            name: user.properties.first_name + " " + user.properties.last_name,
            interests: interests,
            profile_picture: user.properties.profile_picture,
            bio: user.properties.biography,
            age: 21,
            distance: 10,
        };
    });
    return res.status(200).json({
      success: true,
      data: nodes,
      count: nodes.length
  });
  } catch (error) {
    res.status(500).json({ error: "Matching error" });
  } finally {
	// console.log(result);
    await session.close();
  }
});

export default match;

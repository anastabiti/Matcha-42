import express, { response } from "express";
import neo4j, { Record } from "neo4j-driver";
import { authenticateToken_Middleware } from "./auth";
import { driver } from "../database";
import { getSocketIO } from "../socket";

const interactions = express.Router();

// interactions.post("/like-user", authenticateToken_Middleware, async (req: any, res: any) => {
//   if (!req.user) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   const user = req.user;
//   const username = user.username;
//   const { likedUsername } = req.body;

//   const session = driver.session();
//   try {
//     const result = await session.run(
//       `
// 		MATCH (u:User {username: $username})
// 		MATCH (otherUser:User {username: $likedUsername})
// 		WHERE u <> otherUser
//     SET otherUser.fame_rating = otherUser.fame_rating + 2
// 		MERGE (u)-[r:LIKES {createdAt: datetime()}]->(otherUser)
// 		WITH u, otherUser, EXISTS((otherUser)-[:LIKES]->(u)) as isMatch

// 		FOREACH(x IN CASE WHEN isMatch THEN [1] ELSE [] END |
// 			MERGE (u)-[m:MATCHED {createdAt: datetime()}]-(otherUser)
// 		)

// 		RETURN {
// 			liked: true,
// 			isMatch: isMatch,
// 			matchedAt: CASE WHEN isMatch THEN datetime() ELSE null END
// 		} as result`,
//       { username, likedUsername }
//     );

//     if (result.records.length > 0) {
//       return res.status(200).json({ success: true });
//     } else {
//       return res.status(400).json({ error: "Failed to like user" });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   } finally {
//     await session.close();
//   }
// });

interactions.post("/like-user", authenticateToken_Middleware, async (req: any, res: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = req.user;
  const username = user.username;
  const { likedUsername } = req.body;

  const session = driver.session();
  try {
    // Check if the current user has completed setup
    const setupCheckResult = await session.run(
      `
          MATCH (u:User {username: $username})
          RETURN u.setup_done as hasProfilePic
          `,
      { username }
    );

    const hasProfilePic = setupCheckResult.records[0]?.get("hasProfilePic");

    if (!hasProfilePic) {
      // Return a normal response indicating setup is required
      return res.status(200).json({
        success: false,
        setupRequired: true,
        message: "Profile setup required",
      });
    }

    // Proceed with the like action
    const result = await session.run(
      `
          MATCH (u:User {username: $username})
          MATCH (otherUser:User {username: $likedUsername})
          WHERE u <> otherUser
          SET otherUser.fame_rating = otherUser.fame_rating + 2
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

    if (result.records.length > 0) {
      ///atabiti like notification 
      const notification_message = `Like: ❤️${req.user.username} Liked YOU ❤️!`;
      const result_ = await session.run(
        `
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
          RETURN n`,
        {
          fromUsername: req.user.username,
          username: likedUsername,
          type: "Liked",
          content: notification_message,
        }
      );

      const notification = result_.records[0].get("n").properties;
      getSocketIO().to(likedUsername).emit("notification", notification);

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

interactions.post("/unlike-user", authenticateToken_Middleware, async (req: any, res: any) => {
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
            SET otherUser.fame_rating = otherUser.fame_rating - 1
            WITH u, otherUser
            OPTIONAL MATCH (u)-[l:LIKES]->(otherUser)
            OPTIONAL MATCH (u)-[m:MATCHED]-(otherUser)
            DELETE l, m
            RETURN {
                unliked: true,
                wasMatched: EXISTS((u)-[:MATCHED]-(otherUser))
            } as result
            `,
      { username, likedUsername }
    );

    if (result.records.length > 0) {
      const notification_message = `Unlike:😟 ${req.user.username} UnLiked you 😥`;
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
            username:likedUsername,
            type:"UnLiked",
            content:notification_message
           });

           const notification = result_.records[0].get('n').properties;
        getSocketIO().to(likedUsername).emit("notification", notification);
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ error: "Failed to unlike user" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await session.close();
  }
});

interactions.post("/view-profile", authenticateToken_Middleware, async (req: any, res: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = req.user;
  const username = user.username;
  const { viewedUsername } = req.body;

  const session = driver.session();
  try {
    const result = await session.run(
      `
            MATCH (viewer:User {username: $username})
            MATCH (viewed:User {username: $viewedUsername})
            WHERE viewer <> viewed
            SET viewed.fame_rating = viewed.fame_rating + 1
            MERGE (viewer)-[r:VIEWED]->(viewed)
            SET r.lastViewedAt = datetime()
            RETURN {
                success: true,
                lastViewedAt: r.lastViewedAt
            } as result
            `,
      { username, viewedUsername }
    );

    if (result.records.length > 0) {
      const record = result.records[0].get("result");
      return res.status(200).json({
        success: true,
        lastViewedAt: record.lastViewedAt,
      });
    } else {
      return res.status(400).json({ error: "Failed to record view" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await session.close();
  }
});

interactions.post("/blocks/:username", authenticateToken_Middleware, async (req: any, res: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = req.user;
  const username = user.username;

  const blockedUsername = req.params.username;

  const session = driver.session();
  try {
    const result = await session.run(
      `
		MATCH (u:User {username: $username}), 
			  (blockedUser:User {username: $blockedUsername})
		WHERE u <> blockedUser
    SET blockedUser.fame_rating = blockedUser.fame_rating - 5
		MERGE (u)-[b:BLOCKED {
			createdAt: datetime()
		}]->(blockedUser)
		WITH u, blockedUser
		OPTIONAL MATCH (u)-[l:LIKES]->(blockedUser)
		OPTIONAL MATCH (u)-[m:MATCHED]-(blockedUser)
		DELETE l, m
		RETURN true as blocked
		`,
      { username, blockedUsername }
    );
    return res.status(200).json({
      success: true,
      blocked: result.records[0].get("blocked"),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Failed to block user" });
  } finally {
    await session.close();
  }
});

interactions.get("/profile-viewers", authenticateToken_Middleware, async (req: any, res: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const username = req.user.username;
  const session = driver.session();

  try {
    const result = await session.run(
      `
            MATCH (viewer:User)-[v:VIEWED]->(user:User {username: $username})
            RETURN {
                username: viewer.username,
                first_name: viewer.first_name,
                last_name: viewer.last_name,
                profile_picture: viewer.profile_picture,
                lastViewedAt: v.lastViewedAt
            } as viewer
            ORDER BY v.lastViewedAt DESC
            `,
      { username }
    );

    const viewers = result.records.map((record: Record) => record.get("viewer"));

    return res.status(200).json({
      success: true,
      viewers: viewers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await session.close();
  }
});

interactions.delete(
  "/blocks/:username",
  authenticateToken_Middleware,
  async (req: any, res: any) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = req.user;
    const username = user.username;
    const unblockedUsername = req.params.username;

    const session = driver.session();
    try {
      const result = await session.run(
        `
		MATCH (u:User {username: $username})-[b:BLOCKED]->(blockedUser:User {username: $unblockedUsername})
		DELETE b
		RETURN {
		  unblocked: true,
		  unblockedUser: blockedUser.username
		} as result
		`,
        { username, unblockedUsername }
      );

      if (result.records.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Block relationship not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: result.records[0].get("result"),
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: "Failed to unblock user",
      });
    } finally {
      await session.close();
    }
  }
);

interactions.post(
  "/reports/:username",
  authenticateToken_Middleware,
  async (req: any, res: any) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = req.user;
    const username = user.username;
    const reportedUsername = req.params.username;

    const reason = "FAKE_ACCOUNT";

    const session = driver.session();
    try {
      const result = await session.run(
        `
		MATCH (reporter:User {username: $username}), 
			  (reportedUser:User {username: $reportedUsername})
		WHERE reporter <> reportedUser
    SET reportedUser.fame_rating = reportedUser.fame_rating - 5
		MERGE (reporter)-[r:REPORTED {
		  createdAt: datetime()
		}]->(reportedUser)
		RETURN {
		  reported: true,
		  reportedUser: reportedUser.username,
		  reportId: id(r),
		  status: r.status,
		  createdAt: r.createdAt
		} as result
		`,
        {
          username,
          reportedUsername,
          reason,
        }
      );

      return res.status(200).json({
        success: true,
        data: result.records[0].get("result"),
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        error: "Failed to report user",
      });
    } finally {
      await session.close();
    }
  }
);

interactions.get("/visit-history", authenticateToken_Middleware, async (req: any, res: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const username = req.user.username;
  const session = driver.session();

  try {
    const result = await session.run(
      `
            MATCH (user:User {username: $username})-[v:VIEWED]->(viewed:User)
            RETURN {
                username: viewed.username,
                first_name: viewed.first_name,
                last_name: viewed.last_name,
                profile_picture: viewed.profile_picture,
                lastViewedAt: v.lastViewedAt
            } as history
            ORDER BY v.lastViewedAt DESC
            `,
      { username }
    );

    const history = result.records.map((record: Record) => record.get("history"));

    return res.status(200).json({
      success: true,
      history: history,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await session.close();
  }
});

interactions.get("/profile-likes", authenticateToken_Middleware, async (req: any, res: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const username = req.user.username;
  const session = driver.session();

  try {
    const result = await session.run(
      `
          MATCH (liker:User)-[l:LIKES]->(user:User {username: $username})
          RETURN {
              username: liker.username,
              first_name: liker.first_name,
              last_name: liker.last_name,
              profile_picture: liker.profile_picture,
              lastViewedAt: l.createdAt
          } as likes
          ORDER BY l.createdAt DESC
          `,
      { username }
    );

    const likes = result.records.map((record: Record) => record.get("likes"));

    return res.status(200).json({
      success: true,
      likes: likes,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await session.close();
  }
});

export default interactions;

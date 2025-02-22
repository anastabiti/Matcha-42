import express, { Request, Response } from "express";
import { authenticateToken_Middleware, generateAccessToken } from "./auth";
import { driver } from "../database";
import { Record } from "neo4j-driver";

const notify = express.Router();


/**************************************************************************************************************
 * Get all notifications that are not read yet by the user 
 *  by  𝟏𝟑𝟑𝟕 𝐚𝐭𝐚𝐛𝐢𝐭𝐢 ʕʘ̅͜ʘ̅ʔ
 **************************************************************************************************************/
notify.get(
  "/notifications",
  authenticateToken_Middleware,
  async function (req: Request, res: Response) {
    const session = driver.session();
    const user: any = req.user;
    try {
      const query = `
          MATCH (user:User {username: $username})-[:YOU_HAVE_A_NOTIFICATION]->(n:Notification)
          RETURN {
            notify_id: n.notify_id,
            fromUsername: n.fromUsername,
            type: n.type,
            content: n.content,
            createdAt: n.createdAt,
            isRead: n.isRead
          } as notification
          ORDER BY n.createdAt DESC
        `;

      const result = await session.run(query, {
        username: user?.username,
      });

      const notifications = result.records.map((record: Record) => record.get("notification"));
      res.status(200).json(notifications);
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch notifications" });
    } finally {
      await session.close();
    }
  }
);


/**************************************************************************************************************
 * Mark a notification as read
 * it uses notificationId to mark a notification as read
 *  by  𝟏𝟑𝟑𝟕 𝐚𝐭𝐚𝐛𝐢𝐭𝐢 ʕʘ̅͜ʘ̅ʔ
 **************************************************************************************************************/
notify.patch(
  "/notifications/:notificationId/read",
  authenticateToken_Middleware,
  async function (req: Request, res: Response) {
    const session = driver.session();
    const user: any = req.user;
    const notf_ID = req.params;



    try {
      if (session) {

        const result = await session.run(
          `MATCH (user:User {username: $username})-[r:YOU_HAVE_A_NOTIFICATION]->(n:Notification {notify_id: $notificationId}) 
            DELETE r,n
           RETURN user`,
          {
            username: user.username,
            notificationId: notf_ID.notificationId,
          }
        );
        res.status(200).json("DONE");
      }
      return;
    } finally {
      await session.close();
    }
  }
);
/**************************************************************************************************************
 * Mark all notifications as read
 * by  𝟏𝟑𝟹𝟕 𝐚𝐭𝐚𝐛𝐢𝐭𝐢 ʕʘ̅͜ʘ̅ʔ
 * **************************************************************************************************************/
notify.patch(
  "/notifications/read-all",
  authenticateToken_Middleware,
  async function (req: Request, res: Response) {
    const session = driver.session();
    const user: any = req.user;



    try {
      if (session) {

        const result = await session.run(
          `MATCH (user:User {username: $username})-[r:YOU_HAVE_A_NOTIFICATION]->(n:Notification) 
            DELETE r,n
           RETURN user`,
          {
            username: user.username,
          }
        );
        res.status(200).json("DONE");
      }
      return;
    } finally {
      await session.close();
    }
  }
);

export default notify;

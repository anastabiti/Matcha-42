import express, { Request, Response } from "express";
import { authenticateToken_Middleware, generateAccessToken } from "./auth";
import { driver } from "../database";
import { Record } from "neo4j-driver";

const chat = express.Router();

/**************************************************************************************************************
 * GET ALL  MESSAGES BETWEEEN TWO USERS 
 * RETURN [
  {
    "content": "msg1 ",
    "createdAt": 1739952831256,
    "sender": "sender",
    "receiver": "rec"
  },
  ]
 *  by  𝟏𝟑𝟑𝟕 𝐚𝐭𝐚𝐛𝐢𝐭𝐢 ʕʘ̅͜ʘ̅ʔ
 **************************************************************************************************************/
chat.get(
  "/chat/get_messages/:username",
  authenticateToken_Middleware,
  async function (req: Request, res: Response) {
    try {
      const messages_with_username = req.params.username;
      const user: any = req.user;
      const new_session = driver.session();
      if (new_session) {
        const all_messages = await new_session.run(
          `
          MATCH (u1:User {username: $username1}), (u2:User {username: $username2})
          MATCH (sender)-[:SENT]->(m:Message)-[:RECEIVED_BY]->(receiver)
              WHERE (sender = u1 AND receiver = u2) OR (sender = u2 AND receiver = u1)
          RETURN m.content AS content,
              m.createdAt AS createdAt,
              sender.username AS sender,
              receiver.username AS receiver
          ORDER BY createdAt ASC`
          ,
          //will be ordered by the createdAt timestamp from oldest to newest
          { username1: user.username, username2: messages_with_username }
        );

        if (all_messages.records.length > 0) {
          const messages = all_messages.records.map((record: Record) => ({
            content: record.get("content"),
            createdAt: record.get("createdAt"),
            sender: record.get("sender"),
            receiver: record.get("receiver"),
          }));

          res.status(200).json(messages);
          await new_session.close();
          return;
        } else {
          const messages = {};
          res.status(200).json(messages);
          await new_session.close();
          return;
        }
      }

      res.status(400).json("DB ERROR");
      return;
    } catch {
      res.status(400).json("ERROR");
      return;
    }
  }
);
/**************************************************************************************************************
 * GET ALL  USERS A USER CHATTED WITH
 * return
 * [
 *   {
 *     "username": "USERNAME---",
 *     "profilePic": "PIC_url"
 *   }]
 *  by  𝟏𝟑𝟑𝟕 𝐚𝐭𝐚𝐛𝐢𝐭𝐢 ʕʘ̅͜ʘ̅ʔ
 **************************************************************************************************************/
chat.get(
  "/chat/Users_chatedWith",
  authenticateToken_Middleware,
  async function (req: Request, res: Response) {
    const logged_user: any = req.user;

    const new_session = driver.session();
    if (new_session) {
      const query = `
            MATCH (u:User {username: $username}), (other:User)
            WHERE (u)-[:SENT]->(:Message)-[:RECEIVED_BY]->(other)
            OR (other)-[:SENT]->(:Message)-[:RECEIVED_BY]->(u)
          RETURN DISTINCT other.username AS username, other.pics[0] AS profilePic
                    `;
      const params = {
        username: logged_user.username,
      };

      const result = await new_session.run(query, params);
      
      const all_users = result.records.map((record: Record) => ({
        username: record.get("username"),
        profilePic: record.get("profilePic"),
      }));

      res.status(200).json(all_users);
      return;
    }
  }
);
export default chat;

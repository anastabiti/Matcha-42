import express, { Request, Response } from "express";
import { authenticateToken_Middleware, generateAccessToken } from "./auth";
import { driver } from "../database";
import { Record } from "neo4j-driver"; // Add this import at the top

const chat = express.Router();

chat.get(
  "/chat/get_messages/:username",
  authenticateToken_Middleware,
  async function (req: Request, res: Response) {
    try {
      const messages_with_username = req.params.username;

      console.log(messages_with_username, " username to get its messages with ");
      const user: any = req.user;
      const new_session = driver.session();
      if (new_session) {
        // MATCH p=(:User {username:"atabiti"})-[:SENT]->(:Message )-[:RECEIVED_BY]->(:User {username:"atabiti_4f4853b7ff6f272e1a45"}) RETURN p LIMIT 25;
        //       const all_messages =await  new_session.run(
        //         `
        // MATCH (sender:User {username: $username1})-[:SENT]->(m:Message)-[:RECEIVED_BY]->(receiver:User {username: $username2})
        // RETURN m.content as content, m.createdAt as createdAt, sender.username as sender, receiver.username as receiver

        // UNION
        // MATCH (sender:User {username: $username2})-[:SENT]->(m:Message)-[:RECEIVED_BY]->(receiver:User {username: $username1})
        // RETURN m.content as content, m.createdAt as createdAt, sender.username as sender, receiver.username as receiver
        // ORDER BY createdAt ASC

        //         `,
        //         { username1: user.username, username2: messages_with_username }
        //       );
        const all_messages = await new_session.run(
          `
    MATCH (sender:User {username: $username1})-[:SENT]->(m:Message)-[:RECEIVED_BY]->(receiver:User {username: $username2})
    RETURN m.content AS content, m.createdAt AS createdAt, sender.username AS sender, receiver.username AS receiver
    UNION
    MATCH (sender:User {username: $username2})-[:SENT]->(m:Message)-[:RECEIVED_BY]->(receiver:User {username: $username1})
    RETURN m.content AS content, m.createdAt AS createdAt, sender.username AS sender, receiver.username AS receiver
    ORDER BY createdAt ASC
    `,
          { username1: user.username, username2: messages_with_username }
        );

        console.log("\n\n", all_messages.records, " records\n\n");
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

chat.get(
  "/chat/Users_chatedWith",
  authenticateToken_Middleware,
  async function (req: Request, res: Response) {
    const logged_user: any = req.user;
    console.log(logged_user, " logged user is ");
    const new_session = driver.session();
    if (new_session) {
      // MATCH (sender:User {username: $me})-[:SENT]->(m:Message)-[:RECEIVED_BY]-(receivers:User)
      // RETURN receivers
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
      // const all_users = result.records.map((record: Record) => record.get("chatPartners"));
      const all_users = result.records.map((record: Record) => ({
        username: record.get('username'),
        profilePic: record.get('profilePic')
      }));;
      console.log(all_users, "Users that the current user has chatted with");
      res.status(200).json(all_users);
      return;
    }
  }
);
export default chat;

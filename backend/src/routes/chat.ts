import express, { Request, Response } from "express";
import { authenticateToken_Middleware, generateAccessToken } from "./auth";
import { driver } from "../database";
import { Record } from "neo4j-driver"; // Add this import at the top

const chat = express.Router();

chat.get(
  "/chat/get_messages/:username",
  authenticateToken_Middleware,
  async function (req: Request, res: Response) {
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

        // console.log('Messages:', JSON.stringify(messages, null, 2));
        res.status(200).json(messages);

        return;
      } else {
        // const messages = {
        //   content: "",
        //   date: "",
        //   sender: "",
        //   receiver: "",
        // };
        const messages = {}
        res.status(200).json(messages);
        return;
      }
    }

    res.status(200).json("DONE");
    return;
  }
);
export default chat;

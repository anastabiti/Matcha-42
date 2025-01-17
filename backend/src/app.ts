import express, { Application, Request, Response } from "express";
const bodyParser = require("body-parser");
const app: Application = express();
import  registrationRouter from  "../routes/registration";
import authRouter from "../routes/auth";
require("../database/index.ts");

app.get("/", (req: Request, res: Response) => {
  res.send("Hello Welcome to Matcha!");
});


// Use body-parser middleware
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api", registrationRouter);
app.use("/api", authRouter);

export default app;

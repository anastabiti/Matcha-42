import express, { Application, Request, Response } from "express";
const cors = require("cors");
const bodyParser = require("body-parser");
const app: Application = express();
import  registrationRouter from  "../routes/registration";
import authRouter from "../routes/auth";
require("../database/index.ts");



// fix cors issues
const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  // allowedHeaders: ["Content-Type"],
  credentials: true,
};

app.use(cors(corsOptions));


app.get("/", (req: Request, res: Response) => {
  res.send("Hello Welcome to Matcha!");
});


// Use body-parser middleware
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api", registrationRouter);
app.use("/api", authRouter);

export default app;

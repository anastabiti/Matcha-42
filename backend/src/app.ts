import express, { Application, Request, Response } from "express";
import cors from "cors"; 
import bodyParser from "body-parser"; 
import session from "express-session";
import passport from "passport"; 
import registrationRouter from "../routes/registration";
import authRouter from "../routes/auth";
import "../database/index"; 
import Facebook_auth from "../routes/Strategies/facebook";
import Google_auth from "../routes/Strategies/google";
import forty_two_str from "../routes/Strategies/42stra";
const app: Application = express();
// https://www.npmjs.com/package/connect-neo4j
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(
  "neo4j://localhost:7687",
  neo4j.auth.basic(process.env.database_username, process.env.database_password)
);
let Neo4jStore = require('connect-neo4j')(session)


app.use(session({
  store: new Neo4jStore({ client: driver }),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false, //to avoid storing all sessions even not looged in users
     cookie: {
      // secure: true,
      httpOnly: false, // Prevent JavaScript access to cookies
      sameSite: 'lax', // Ensures cookies are sent with requests from the same site
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}))

// app.use(session({
//   genid: function(req) {
//     return genuuid() // use UUIDs for session IDs
//   },
//   secret: 'keyboard cat'
// }))

// fix cors issues
const corsOptions = {
  origin: "http://localhost:7070",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  // allowedHeaders: ["Content-Type"],
  credentials: true,
};
app.use(passport.initialize());
app.use(cors(corsOptions));



app.get("/", (req: Request, res: Response) => {
  res.send("Hello Welcome to Matcha!");
});


// Use body-parser middleware
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api", registrationRouter);
app.use("/api", authRouter);
app.use("/api", Facebook_auth);
app.use("/api", Google_auth);
app.use("/api", forty_two_str);

export default app;

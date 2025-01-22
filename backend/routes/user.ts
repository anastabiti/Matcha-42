import express, { Request, Response } from "express";
const { body, validationResult } = require("express-validator");

const user_information_Router = express.Router();

// {
//     gender: 'Homosexual',
//     sexual_preferences: '',
//     biography: 'wewewe',
//     interests: [ 'Photography', 'Shopping', 'Tennis', 'Art' ]
//   }
user_information_Router.post(
  "/user/information",
  //   body("gender").isEmpty(),
  //   body("biography").isEmpty(),

  async (req: any, res: Response) => {
    const errors = validationResult(req);
    // if (!errors.isEmpty())
    //    res.status(400).json({ errors: errors.array() });
    // else {
    //get user looged in
    console.log(req.session.user, "  ===}}}}}}}]]]]]") 
    const _user = req.session.user;
    if (!_user) 
        res.status(401).json( "Unauthorized");
    else {
      console.log("user information route");
      console.log(_user);
      console.log(req.body);
      res.status(200).json( "User information route");
    }
  }
  //   }
);
export default user_information_Router;

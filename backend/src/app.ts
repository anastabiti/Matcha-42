



import express, { Application, Request, Response } from 'express';
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator')


const app: Application = express();

require('../database/index.ts');


app.get('/', (req: Request, res: Response) => {
  res.send('Hello Welcome to Matcha!');
});



// Use body-parser middleware
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// registration route
app.post('/registration', body('email').isEmail(),
  body('password').isLength({ min: 6 }), (req: Request, res: Response) => {
    const errors = validationResult(req)
    console.log(errors, 'errors');

    if (!errors.isEmpty())
      res.status(400).json({ errors: errors.array() })
    else {
      // console.log(req.body, 'req.body');
      console.log(req.body.username, ' username');
      console.log(req.body.email, ' email');
      console.log(req.body.password, ' password');
      console.log(req.body.last_name, ' last_name');
      console.log(req.body.first_name, ' first_name');
      res.send('Hello Welcome to Matcha registration!');


    }
  });






export default app

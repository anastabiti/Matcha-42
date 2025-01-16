import express, { Application, Request, Response } from 'express';

const app: Application = express();

require('../database/index.ts');


app.get('/', (req: Request, res: Response) => {
  res.send('Hello Welcome to Matcha!');
});

export default app

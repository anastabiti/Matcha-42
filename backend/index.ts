import dotenv from "dotenv";
import app from "./src/app";
import { setupSocket } from "./src/socket";

dotenv.config();
const port = process.env.PORT || 3000;
import http from "http";
const server = http.createServer(app);
setupSocket(server);
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

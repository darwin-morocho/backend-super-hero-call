import express, { Application } from "express";
import http from "http";
import io from "socket.io";
import dotenv from "dotenv";
import ws from "./ws";
dotenv.config();

const app: Application = express();
const server: http.Server = new http.Server(app);

ws(io(server));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`running on ${PORT}`);
});

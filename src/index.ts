import express, { Application } from "express";
import http from "http";
import io from "socket.io";
import axios from "axios";
import dotenv from "dotenv";
import ws from "./ws";
dotenv.config();

const app: Application = express();
const server: http.Server = new http.Server(app);

ws(io(server));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`running on ${PORT}`);
  //every 5 minutes
  setInterval(() => {
    axios.get("https://backend-super-hero-call.herokuapp.com");
  }, 1000 * 60 * 5);
});

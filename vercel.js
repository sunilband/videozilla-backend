// vercel.js
import { createServer } from "http";
import { app } from "./src/app.js";

const server = createServer(app);

export default server;

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
// ------------------ MiddleWares ------------------
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "20kb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "20kb",
  })
);
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello from Express");
});

// ------------------ Routes ------------------
import userRouter from "./routes/user.route.js";
app.use("/api/v1/users", userRouter);
export { app };

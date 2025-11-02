import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser"


const app = express()

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "DELETE", "PATCH", "PUT", "OPTIONS"],
};

app.use(
  cors(corsOptions)
);

// app.options("*", cors(corsOptions));
app.options("/", cors(corsOptions))

app.use(express.json({ limit: "16kb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(express.static("public"));

app.use(cookieParser())



// routes

import { userRouter } from "./routes/user.route.js";
import { memberRouter } from "./routes/member.route.js";
import reportRouter from "./routes/report.route.js";
 
app.use("/api/v1/auth", userRouter)


app.use("/api/v1/", memberRouter);
app.use("/api/v1/report", reportRouter);



app.get("/", (req, res) => {
  res.send("🚀 Backend running successfully on Render!");
});


export { app }
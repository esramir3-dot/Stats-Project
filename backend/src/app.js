const path = require("path");
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const { corsOrigin } = require("./config/env");
const dormEatsRoutes = require("./routes/dormEatsRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: corsOrigin === "*" ? true : corsOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "dormeats-api" });
});

app.use("/api", dormEatsRoutes);

if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use(errorHandler);

module.exports = app;

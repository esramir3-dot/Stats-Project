require("dotenv").config();

module.exports = {
  port: Number(process.env.PORT || 4000),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  dataStore: process.env.DATASTORE || "memory"
};

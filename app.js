const path = require("node:path");
const express = require("express");
const gamesRouter = require("./routes/games");

const app = express();

app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/games", gamesRouter);

app.use((error, _request, response, _next) => {
  console.error(error);
  return response
    .status(500)
    .json({ error: "An unexpected server error occurred." });
});

module.exports = app;

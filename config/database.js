const fs = require("node:fs");
const path = require("node:path");
const { Sequelize } = require("sequelize");

const storage = path.join(__dirname, "..", "data", "blackjack.sqlite");

fs.mkdirSync(path.dirname(path.resolve(storage)), { recursive: true });

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage,
  logging: false,
});

module.exports = sequelize;

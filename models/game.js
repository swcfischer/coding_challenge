const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Game = sequelize.define(
  "Game",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "player_turn",
      validate: {
        isIn: [["player_turn", "player_win", "dealer_win", "push"]],
      },
    },
    playerHand: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    dealerHand: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    deck: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    version: true,
  },
);

module.exports = Game;

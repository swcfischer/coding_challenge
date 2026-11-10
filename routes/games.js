const express = require("express");
const Game = require("../models/game");
const {
  createGame,
  takeTurn,
  toGameResponse,
} = require("../services/blackjack");

const router = express.Router();

router.post("/", async (_request, response, next) => {
  try {
    const game = await Game.create(createGame());
    response.status(201).json({ game: toGameResponse(game) });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (request, response, next) => {
  try {
    const game = await Game.findByPk(request.params.id);
    if (!game) {
      return response.status(404).json({ error: "Game not found." });
    }
    return response.json({ game: toGameResponse(game) });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/actions", async (request, response, next) => {
  try {
    const game = await Game.findByPk(request.params.id);
    if (!game) {
      return response.status(404).json({ error: "Game not found." });
    }

    takeTurn(game, request.body.action);
    game.changed("playerHand", true);
    game.changed("dealerHand", true);
    game.changed("deck", true);
    await game.save();

    return response.json({ game: toGameResponse(game) });
  } catch (error) {
    // * The game was updated by another request before this one could save its changes.
    if (error.name === "SequelizeOptimisticLockError") {
      return response
        .status(409)
        .json({ error: "The game changed. Refresh and try again." });
    }
    if (error.status) {
      return response.status(error.status).json({ error: error.message });
    }
    return next(error);
  }
});

module.exports = router;

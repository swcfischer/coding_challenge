const SUITS = ["clubs", "diamonds", "hearts", "spades"];
const FACE_VALUES = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

function createDeck() {
  const deck = SUITS.flatMap((suit) =>
    FACE_VALUES.map((faceValue) => ({ suit, faceValue })),
  );

  // * Shuffle
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }

  return deck;
}

function handValue(cards) {
  let total = 0;
  let aces = 0;

  for (const { faceValue } of cards) {
    if (faceValue === "A") {
      total += 11;
      aces += 1;
    } else if (["K", "Q", "J"].includes(faceValue)) {
      total += 10;
    } else {
      total += Number(faceValue);
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

// * Dealt 21
function is21(cards) {
  return cards.length === 2 && handValue(cards) === 21;
}

function drawCard(game) {
  const card = game.deck.pop();
  if (!card) {
    throw new Error("The deck is empty.");
  }
  return card;
}

function settleGame(game) {
  while (handValue(game.dealerHand) < 17) {
    game.dealerHand.push(drawCard(game));
  }

  const playerTotal = handValue(game.playerHand);
  const dealerTotal = handValue(game.dealerHand);

  if (dealerTotal > 21 || playerTotal > dealerTotal) {
    game.status = "player_win";
  } else if (playerTotal < dealerTotal) {
    game.status = "dealer_win";
  } else {
    game.status = "push";
  }

  return game;
}

function createGame() {
  const game = {
    status: "player_turn",
    playerHand: [],
    dealerHand: [],
    deck: createDeck(),
  };

  game.playerHand.push(drawCard(game));
  game.dealerHand.push(drawCard(game));
  game.playerHand.push(drawCard(game));
  game.dealerHand.push(drawCard(game));

  const playerTwentyOne = is21(game.playerHand);
  const dealerTwentyOne = is21(game.dealerHand);

  if (playerTwentyOne || dealerTwentyOne) {
    if (playerTwentyOne && dealerTwentyOne) {
      // * Tie
      game.status = "push";
    } else {
      game.status = playerTwentyOne ? "player_win" : "dealer_win";
    }
  }

  return game;
}

function takeTurn(game, action) {
  if (game.status !== "player_turn") {
    const error = new Error("This game is already over.");
    error.status = 409;
    throw error;
  }

  if (action === "hit") {
    game.playerHand.push(drawCard(game));

    if (handValue(game.playerHand) > 21) {
      game.status = "dealer_win";
    } else if (handValue(game.playerHand) === 21) {
      settleGame(game);
    }

    return game;
  }

  if (action === "stand") {
    return settleGame(game);
  }

  const error = new Error('Action must be either "hit" or "stand".');
  error.status = 400;
  throw error;
}

function toGameResponse(game) {
  const finished = game.status !== "player_turn";
  const visibleDealerCards = finished
    ? game.dealerHand
    : [game.dealerHand[0], null];

  return {
    id: game.id,
    status: game.status,
    player: {
      cards: game.playerHand,
      score: handValue(game.playerHand),
    },
    dealer: {
      cards: visibleDealerCards,
      score: finished
        ? handValue(game.dealerHand)
        : handValue(game.dealerHand.slice(0, 1)),
      holeCardHidden: !finished,
    },
    remainingCards: game.deck.length,
  };
}

module.exports = {
  createGame,
  takeTurn,
  toGameResponse,
};

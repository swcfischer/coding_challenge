const SUIT_SYMBOLS = {
  clubs: "♣",
  diamonds: "♦",
  hearts: "♥",
  spades: "♠",
};
const GAME_STORAGE_KEY = "blackjack-game-id";

const elements = {
  dealerCards: document.querySelector("#dealer-cards"),
  dealerScore: document.querySelector("#dealer-score"),
  hit: document.querySelector("#hit"),
  message: document.querySelector("#message"),
  newGame: document.querySelector("#new-game"),
  playerCards: document.querySelector("#player-cards"),
  playerScore: document.querySelector("#player-score"),
  stand: document.querySelector("#stand"),
};

let gameId = null;
let gameStatus = null;
let busy = false;

function renderCards(container, cards) {
  container.replaceChildren();

  for (const card of cards) {
    const element = document.createElement("div");
    element.className = "card";

    if (card === null) {
      element.classList.add("card-hidden");
      element.textContent = "?";
    } else {
      if (card.suit === "hearts" || card.suit === "diamonds") {
        element.classList.add("card-red");
      }

      const faceValue = document.createElement("span");
      faceValue.className = "card-corner";
      faceValue.textContent = card.faceValue;

      const suit = document.createElement("span");
      suit.className = "card-suit";
      suit.textContent = SUIT_SYMBOLS[card.suit];

      element.append(faceValue, suit);
    }

    container.append(element);
  }
}

function updateControls() {
  const enabled = !busy && gameStatus === "player_turn";
  elements.hit.disabled = !enabled;
  elements.stand.disabled = !enabled;
}

function renderGame(game) {
  gameId = game.id;
  localStorage.setItem(GAME_STORAGE_KEY, gameId);
  gameStatus = game.status;
  renderCards(elements.playerCards, game.player.cards);
  renderCards(elements.dealerCards, game.dealer.cards);
  elements.playerScore.textContent = `Score: ${game.player.score}`;
  elements.dealerScore.textContent = game.dealer.holeCardHidden
    ? `Showing: ${game.dealer.score}`
    : `Score: ${game.dealer.score}`;

  const messages = {
    player_turn: "Your turn. Hit or stand.",
    player_win: "You win!",
    dealer_win:
      game.player.score > 21 ? "You bust. Dealer wins." : "Dealer wins.",
    push: "It's a push. The hand is a tie.",
  };
  elements.message.textContent = messages[game.status];
  updateControls();
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const payload = await response.json();

  if (!response.ok) {
    const error = new Error(
      payload.error || "The request could not be completed.",
    );
    error.status = response.status;
    throw error;
  }

  return payload;
}

async function run(action) {
  if (busy) return;
  busy = true;
  updateControls();

  try {
    const result = action
      ? await request(`/api/games/${gameId}/actions`, {
          method: "POST",
          body: JSON.stringify({ action }),
        })
      : await request("/api/games", { method: "POST" });
    renderGame(result.game);
  } catch (error) {
    elements.message.textContent = error.message;
  } finally {
    busy = false;
    updateControls();
  }
}

async function restoreGame() {
  const savedGameId = localStorage.getItem(GAME_STORAGE_KEY);
  if (!savedGameId) return;

  try {
    const result = await request(`/api/games/${savedGameId}`);
    renderGame(result.game);
  } catch (error) {
    if (error.status === 404) {
      localStorage.removeItem(GAME_STORAGE_KEY);
      elements.message.textContent = "Saved game not found. Start a new game.";
      return;
    }

    elements.message.textContent = error.message;
  }
}

elements.newGame.addEventListener("click", () => run());
elements.hit.addEventListener("click", () => run("hit"));
elements.stand.addEventListener("click", () => run("stand"));
restoreGame();

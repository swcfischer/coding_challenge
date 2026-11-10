# Blackjack

Built with Node.js, Express, Sequelize, and SQLite.

The backend is a minimal JSON RESTful API,
alongside a vanilla JavaScript browser interface
that lets you play a hand against the dealer.

Game ID is stored in localStorage, so you can refresh the browser
and the game will persist

## Requirements

- Node.js 20.x
- npm

## Run locally

```sh
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000). The SQLite database is created at `data/blackjack.sqlite` on first launch.

Set `PORT`

## REST API

| Method | Path                     | Description                                                     |
| ------ | ------------------------ | --------------------------------------------------------------- |
| `POST` | `/api/games`             | Create and deal a new game.                                     |
| `GET`  | `/api/games/:id`         | Retrieve a game.                                                |
| `POST` | `/api/games/:id/actions` | Play an action with `{"action":"hit"}` or `{"action":"stand"}`. |

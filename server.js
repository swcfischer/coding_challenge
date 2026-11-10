const app = require("./app");
const sequelize = require("./config/database");

const port = Number(process.env.PORT) || 3000;

async function start() {
  await sequelize.authenticate();
  await sequelize.sync();

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Could not start the server.", error);
  process.exitCode = 1;
});

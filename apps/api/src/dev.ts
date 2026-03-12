import { buildApp } from "./index.js";

const app = await buildApp();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Server listening at ${address}`);
});

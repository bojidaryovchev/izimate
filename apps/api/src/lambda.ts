import awsLambdaFastify from "@fastify/aws-lambda";
import { buildApp } from "./index.js";

const app = await buildApp();
await app.ready();

export const handler = awsLambdaFastify(app);

import Express from "express";
import cors from "cors";
import { pgConnect } from "./database.js";
import listEndpoints from "express-list-endpoints";
import usersRouter from "./users/index.js";
import experiencesRouter from "./experiences/index.js";
import postsRouter from "./posts/index.js";
import {
  badRequestErrorHandler,
  genericErrorHandler,
  notFoundErrorHandler,
} from "./errorHandlers.js";

const server = Express();
const port = process.env.PORT || 3001;

server.use(cors());
server.use(Express.json());

server.use("/users", usersRouter);
server.use("/users", experiencesRouter);
server.use(`/users`, postsRouter);

server.use(badRequestErrorHandler);
server.use(notFoundErrorHandler);
server.use(genericErrorHandler);

await pgConnect();

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log(`Server port: ${port}`);
});

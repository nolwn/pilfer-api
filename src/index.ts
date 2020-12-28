import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { errorHandler } from "./models/errors";
import authRouter, { checkToken } from "./controllers/auth";
import userRouter from "./controllers/users";
import postRouter from "./controllers/posts";

const app = new Koa();

app.use(bodyParser());
app.use(errorHandler);

// Unauthorized Routes
app.use(authRouter.routes());

app.use(checkToken);

// Authorized Routes
app.use(userRouter.routes());
app.use(postRouter.routes());

app.listen(3000);

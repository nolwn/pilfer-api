import Koa from "koa";
import bodyParser from "koa-bodyparser";
import dotEnv from "dotenv";
import { errorHandler } from "./models/errors";
import userRouter from "./controllers/users";
dotEnv.config();

const app = new Koa();

app.use(bodyParser());
app.use(errorHandler);
app.use(userRouter.routes());

app.listen(3000);

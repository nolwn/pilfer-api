import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "koa-bodyparser";
import dotEnv from "dotenv";
import { handleCreateUser, handleGetUsers } from "./controllers/users";
dotEnv.config();

const router = new Router();
const app = new Koa();

app.use(bodyParser());

router.get("Get users", "/api/users", handleGetUsers);
router.post("Create user", "/api/users", handleCreateUser);

app.use(router.routes());

app.listen(3000);

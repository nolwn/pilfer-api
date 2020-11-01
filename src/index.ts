import Koa from "koa";
import Router from "@koa/router";
import dotEnv from "dotenv";
import { handleUsers } from "./controllers/users";
dotEnv.config();

const router = new Router();
const app = new Koa();

router.get("Users", "/api/users", handleUsers);

app.use(router.routes());

app.listen(3000);

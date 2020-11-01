"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var koa_1 = __importDefault(require("koa"));
var router_1 = __importDefault(require("@koa/router"));
var dotenv_1 = __importDefault(require("dotenv"));
var users_1 = require("./controllers/users");
dotenv_1.default.config();
var router = new router_1.default();
var app = new koa_1.default();
router.get("Users", "/api/users", users_1.handleUsers);
app.use(router.routes());
app.listen(3000);

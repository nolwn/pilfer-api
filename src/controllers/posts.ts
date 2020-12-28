import Router, { RouterContext } from "@koa/router";
import { Post, PostRecord, User } from "../types";
import { PostInput, validate } from "../types.validator";
import * as response from "../response";
import Records from "../models/Records";

const router = new Router({ prefix: "/api/posts" });
router.post("/", createPost);
router.get("/", getPosts);

const postRecords = new Records<Post, PostRecord>("posts", "PostRecord");

async function createPost(ctx: RouterContext): Promise<void> {
	let postInput: PostInput;
	const user: User = ctx.state.user;

	try {
		postInput = validate("PostInput")(ctx.request.body);
	} catch (e) {
		response.badRequest(ctx, e.message);

		return;
	}

	const post: Post = {
		author: user.username,
		postDate: new Date().toISOString(),
		score: 0,
	};

	if (postInput.link) post.link = postInput.link;
	if (postInput.text) post.text = postInput.text;

	const ID = await postRecords.createRecord(post);

	response.created(ctx, ID);
}

async function getPosts(ctx: RouterContext): Promise<void> {
	const posts = await postRecords.getAllRecords();

	response.ok(ctx, posts);
}

export default router;

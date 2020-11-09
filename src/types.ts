export interface User {
	email: string;
	username: string;
}

export interface UserInput {
	password: string;
	email: string;
	username: string;
}

export interface UserRecord extends User {
	ID: string;
}

export interface Post {
	author: string;
	link?: string;
	postDate: string;
	score: number;
	text?: string;
}

export interface PostInput {
	link: string;
	text: string;
}

export interface PostRecord extends Post {
	ID: string;
}

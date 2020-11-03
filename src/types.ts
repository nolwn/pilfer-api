export interface User {
	ID: string;
	email: string;
	username: string;
}

export interface UserInput {
	email: string;
	password: string;
	username: string;
}

export interface Post {
	ID: string;
	author: string;
	link: string;
	postDate: string;
	text: string;
}

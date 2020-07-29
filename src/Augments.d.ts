import { Message, TextChannel, User } from '@klasa/core';

declare module 'klasa' {
	interface KlasaChannel extends TextChannel {
		sendMessage(content: string): Promise<Message[]>;
	}

	interface KlasaMessage extends Message {
		sendMessage(content: string): Promise<Message[]>;
		prompt(promptMessage: string): Promise<boolean>;
	}

	interface KlasaUser extends User {
		sendMessage(content: string): Promise<Message[]>;
	}
}
import { Message } from '@klasa/core';

declare module 'klasa' {
	interface KlasaMessage extends Message {
		sendMessage(content: string): Promise<Message[]>;
		prompt(promptMessage: string): Promise<boolean>;
	}
}

import { extender } from '@klasa/core';
import GodfatherChannel from './GodfatherChannel';

export default class GodfatherMessage extends extender.get('Message') {

	public sendMessage(content: string) {
		return this.reply(mb => mb.setContent(content));
	}

	public async prompt(promptMessage: string): Promise<boolean> {
		return (this.channel as GodfatherChannel).prompt(promptMessage, this.author);
	}

}

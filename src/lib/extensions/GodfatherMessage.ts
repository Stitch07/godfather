import { Structures } from 'discord.js';
import type GodfatherChannel from './GodfatherChannel';

export default class GodfatherMessage extends Structures.get('Message') {
	public async prompt(promptMessage: string): Promise<boolean> {
		return (this.channel as GodfatherChannel).prompt(promptMessage, this.author);
	}
}

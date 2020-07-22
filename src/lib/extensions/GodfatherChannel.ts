import { extender } from '@klasa/core';
import Godfather from '@lib/Godfather';

export default class GodfatherChannel extends extender.get('TextChannel') {

	public get game() {
		return (this.client as Godfather).games.get(this.id);
	}

}

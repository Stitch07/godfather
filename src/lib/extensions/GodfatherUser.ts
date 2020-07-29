import { extender } from '@klasa/core';

export default class GodfatherUser extends extender.get('User') {

	public async sendMessage(content: string) {
		const dmChannel = await this.openDM();
		await dmChannel.send(mb => mb.setContent(content));
	}

}

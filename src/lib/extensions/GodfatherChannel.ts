import { Permissions, Structures, User } from 'discord.js';

export default class GodfatherChannel extends Structures.get('TextChannel') {
	public get game() {
		return this.client.games.get(this.id);
	}

	public async prompt(promptMessage: string, promptUser: User): Promise<boolean> {
		const msg = await this.send(promptMessage);
		await msg!.react('🇾');
		await msg!.react('🇳');

		const reactions = await msg.awaitReactions((reaction, user) => user.id === promptUser.id && ['🇾', '🇳'].includes(reaction.emoji.name), {
			max: 1,
			time: 30 * 1000
		});

		const emoji = reactions.first()?.emoji.toString() || '🇳';
		return emoji === '🇾';
	}

	public get attachable() {
		return !this.guild || (this.postable && this.permissionsFor(this.guild.me!)!.has(Permissions.FLAGS.ATTACH_FILES, false));
	}

	public get embedable() {
		return !this.guild || (this.postable && this.permissionsFor(this.guild.me!)!.has(Permissions.FLAGS.EMBED_LINKS, false));
	}

	public get postable() {
		return !this.guild || this.permissionsFor(this.guild.me!)!.has([Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES], false);
	}

	public get readable() {
		return !this.guild || this.permissionsFor(this.guild.me!)!.has(Permissions.FLAGS.VIEW_CHANNEL, false);
	}
}

export class GodfatherDMChannel extends Structures.get('DMChannel') {
	public readonly attachable = true;

	public readonly embedable = true;

	public readonly postable = true;

	public readonly readable = true;
}

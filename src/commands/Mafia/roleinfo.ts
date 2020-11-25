import { Args, CommandContext, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import { Collection, Message, MessageEmbed } from 'discord.js';
import * as roledocs from '../../assets/roledocs.json';
import { allRoles } from '@mafia/roles';
import Role from '@mafia/Role';
import DefaultMap from '@util/DefaultMap';
import { Branding } from '@root/lib/util/utils';
import { factionEmojis } from '@root/lib/constants';
import { codeBlock } from '@sapphire/utilities';

@ApplyOptions<CommandOptions>({
	preconditions: []
})
export default class extends GodfatherCommand {

	public roles!: Collection<string, Role>;

	public async run(message: Message, args: Args, context: CommandContext) {
		const roleName = await args.restResult('string');
		const uniqueRoles = [...new Set(this.roles.values())];

		if (!roleName.success) {
			// maps roles from faction -> role
			const factionalRoles = new Map([...uniqueRoles.reduce((coll, role) => {
				const facRoles = coll.get(role.faction.name);
				facRoles.push(role.name);
				coll.set(role.faction.name, facRoles);
				return coll;
			}, new DefaultMap<string, string[]>(() => [])).entries()].sort((a, b) => b[1].length - a[1].length));

			const description = [];
			for (const [faction, roles] of factionalRoles.entries()) {
				const emote = factionEmojis[faction] ?? '❓';
				for (const role of roles) {
					description.push(`${emote} **${role}**`);
				}
				if (faction === 'Town' || faction === 'Mafia') description.push('');
			}

			const embed = new MessageEmbed()
				.setAuthor('Roles', this.client.user!.displayAvatarURL())
				.setColor(Branding.PrimaryColor)
				.setFooter(`For more information on a specific role, use ${context.prefix}roleinfo <role>.`)
				.setDescription(description.join('\n'));

			return message.channel.send(embed);
		}

		const role = uniqueRoles.find(r => r.name.toLowerCase() === roleName.value.toLowerCase());
		if (!role) throw `I found no role named "${roleName.value}"`;
		const docEntry = roledocs.find(entry => entry.name.toLowerCase() === role.name.toLowerCase());
		if (!docEntry) throw `No documentation for ${role.name} available`;

		const embed = new MessageEmbed()
			.setAuthor(`${role.name} ${role.faction.name === role.name ? '' : `(${role.faction.name})`}`, this.client.user!.displayAvatarURL())
			.setColor(Branding.PrimaryColor)
			.setDescription(codeBlock('diff', docEntry.detailedDescription.join('\n')))
			// @ts-ignore s t a t i c
			.setFooter(`Categories: ${role.constructor.categories.sort().join(', ')}`);
		return message.channel.send(embed);
	}

	public onLoad() {
		this.roles = allRoles.reduce((coll, roleCls) => {
			// this is an embarassing hack
			const role = new roleCls(null, { vests: 1, protects: 1, alerts: 1 });
			return coll.set(role.name, role);
		}, new Collection<string, Role>());
	}

}

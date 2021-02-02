import { factionEmojis } from '@lib/constants';
import GodfatherCommand from '@lib/GodfatherCommand';
import { allRoles } from '@mafia/roles';
import type Role from '@mafia/structures/Role';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, BucketType, CommandContext, CommandOptions, PermissionsPrecondition } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { codeBlock } from '@sapphire/utilities';
import DefaultMap from '@util/DefaultMap';
import { Collection, Message, MessageEmbed } from 'discord.js';
import roledocs from '../../assets/roledocs.json';

@ApplyOptions<CommandOptions>({
	aliases: ['role', 'roles'],
	generateDashLessAliases: true,
	description: 'Shows a list of all roles, and gives you information on a particular role.',
	preconditions: [
		new PermissionsPrecondition('EMBED_LINKS'),
		{ name: 'Cooldown', context: { bucketType: BucketType.Channel, delay: Time.Second * 3 } }
	]
})
export default class extends GodfatherCommand {
	public roles!: Collection<string, Role>;

	public async run(message: Message, args: Args, context: CommandContext) {
		const roleName = args.finished ? null : await args.rest('string');
		const uniqueRoles = [...new Set(this.roles.values())];

		if (!roleName) {
			// maps roles from faction -> role
			const factionalRoles = new Map(
				[
					...uniqueRoles
						.reduce(
							(coll, role) => {
								const facRoles = coll.get(role.faction.name);
								facRoles.push(role.name);
								coll.set(role.faction.name, facRoles);
								return coll;
							},
							new DefaultMap<string, string[]>(() => [])
						)
						.entries()
				].sort((a, b) => b[1].length - a[1].length)
			);

			const description = [];
			for (const [faction, roles] of factionalRoles.entries()) {
				const emote = factionEmojis[faction] ?? '❓';
				for (const role of roles) {
					description.push(`${emote} **${role}**`);
				}
				if (faction === 'Town' || faction === 'Mafia' || faction === 'Cult') description.push('');
			}

			const embed = new MessageEmbed()
				.setAuthor('Roles', this.context.client.user!.displayAvatarURL())
				.setColor('#000000')
				.setFooter(`For more information on a specific role, use ${context.prefix}role-info <role>.`)
				.setDescription(description.join('\n'));

			return message.channel.send(embed);
		}

		const role = uniqueRoles.find((r) => r.name.toLowerCase() === roleName.toLowerCase());
		if (!role) throw `I found no role named "${roleName}"`;
		const docEntry = roledocs.find((entry) => entry.name.toLowerCase() === role.name.toLowerCase());
		if (!docEntry) throw `No documentation for ${role.name} available`;

		const embed = new MessageEmbed()
			.setAuthor(
				`${role.name} ${role.faction.name === role.name ? '' : `(${role.faction.name})`}`,
				this.context.client.user!.displayAvatarURL()
			)
			.setColor('#000000')
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

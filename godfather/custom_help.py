from discord import Embed
from discord.ext.commands import DefaultHelpCommand

EMBED_COLOR = 0x000000
SUPPORT_SERVER = 'https://discord.gg/gFhvChy'


class CustomHelp(DefaultHelpCommand):

    async def send_bot_help(self, mapping):
        embed = Embed()
        embed.color = EMBED_COLOR
        embed.description = '\n'.join([
            self.context.bot.description +
            ' My prefix is `{}`.'.format(self.context.bot.global_prefix),
            '[Support Server]({})'.format(SUPPORT_SERVER)
        ])
        embed.set_author(name=self.context.bot.user.name,
                         icon_url=self.context.bot.user.avatar_url)
        embed.set_footer(text='For information on a specific command, use {}help <command>'.format(
            self.context.bot.global_prefix))

        for cog, commands in mapping.items():
            cog_name = getattr(cog, '__cog_name__', 'Default')
            if len(commands) == 0:
                continue
            command_names = ', '.join(
                [command.name for command in commands if not command.hidden])
            embed.add_field(name=cog_name, value=command_names, inline=False)
        await self.get_destination().send(embed=embed)

    async def send_command_help(self, command):
        if command.hidden:
            return
        command_sig = self.get_command_signature(command)
        command_help = 'No help available.' if command.help is None else command.help

        embed = Embed()
        embed.color = EMBED_COLOR
        embed.set_author(name=self.context.bot.user.name,
                         icon_url=self.context.bot.user.avatar_url)
        embed.add_field(name=command.name, value=command_help)
        embed.add_field(name='Usage', value=command_sig, inline=False)
        await self.get_destination().send(embed=embed)

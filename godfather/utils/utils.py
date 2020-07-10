from datetime import datetime
from discord import TextChannel, Member
from discord.ext.commands import Bot
import asyncio

# General utilities


def pluralize(value: int):
    return 's' if value > 1 else ''


def from_now(time: datetime):
    now = datetime.now()
    delta = time - now if time > now else now - time
    result = ''
    if time > now:
        result += 'in '
    if delta.seconds / 60 > 1:
        min_left = round(delta.seconds / 60)
        result += f'{min_left} minute{pluralize(min_left)}'
    else:
        result += f'{delta.seconds} second{pluralize(delta.seconds)}'
    if time < now:
        result += ' ago'

    return result


def alive_or_recent_jester(player, game):
    if player.role.name == 'Jester' and not player.alive \
            and player.death_reason == f'lynched D{game.cycle}':
        return True
    return player.alive


async def confirm(bot: Bot, prompter: Member, channel: TextChannel, message: str):
    msg = await channel.send(content=message)
    await msg.add_reaction('🇾')
    await msg.add_reaction('🇳')

    def check(reaction, user):
        return user == prompter \
            and str(reaction.emoji) in ['🇾', '🇳'] \
            and reaction.message.id == msg.id

    try:
        reaction, _user = await bot.wait_for(
            'reaction_add', timeout=30.0, check=check)
        return str(reaction.emoji) == '🇾'
    except asyncio.TimeoutError:
        await channel.send(content='Prompt timed out.')
        return None
    finally:
        await msg.delete()

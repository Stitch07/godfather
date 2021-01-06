import { Structures } from 'discord.js';
import GodfatherChannel, { GodfatherDMChannel } from '@lib/extensions/GodfatherChannel';
import GodfatherMessage from './extensions/GodfatherMessage';
import GodfatherGuild from './extensions/GodfatherGuild';

Structures.extend('TextChannel', () => GodfatherChannel);
Structures.extend('Message', () => GodfatherMessage);
Structures.extend('DMChannel', () => GodfatherDMChannel);
Structures.extend('Guild', () => GodfatherGuild);


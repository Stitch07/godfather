import GodfatherChannel, { GodfatherDMChannel } from '@lib/extensions/GodfatherChannel';
import { Structures } from 'discord.js';
import GodfatherMessage from './extensions/GodfatherMessage';

Structures.extend('TextChannel', () => GodfatherChannel);
Structures.extend('Message', () => GodfatherMessage);
Structures.extend('DMChannel', () => GodfatherDMChannel);

import { extender } from '@klasa/core';
import GodfatherChannel from '@lib/extensions/GodfatherChannel';
import GodfatherMessage from './extensions/GodfatherMessage';
import GodfatherUser from './extensions/GodfatherUser';

extender.extend('TextChannel', () => GodfatherChannel);
extender.extend('Message', () => GodfatherMessage);
extender.extend('User', () => GodfatherUser);

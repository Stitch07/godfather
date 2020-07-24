import { extender } from '@klasa/core';
import GodfatherChannel from '@lib/extensions/GodfatherChannel';
import GodfatherMessage from './extensions/GodfatherMessage';

extender.extend('TextChannel', () => GodfatherChannel);
extender.extend('Message', () => GodfatherMessage);

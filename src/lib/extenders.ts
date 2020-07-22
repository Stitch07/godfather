import { extender } from '@klasa/core';
import GodfatherChannel from '@lib/extensions/GodfatherChannel';

extender.extend('TextChannel', () => GodfatherChannel);

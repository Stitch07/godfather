import { mergeDefault } from '@sapphire/utilities';
import type { TextChannel } from 'discord.js';
import { mock } from 'jest-mock-extended';

const DEFAULT_CHANNEL_INFO = {
	name: 'Tester'
};

export interface MockChannelParams {
	name: string;
}

export const createMockChannel = (params: MockChannelParams = DEFAULT_CHANNEL_INFO) => {
	params = mergeDefault(DEFAULT_CHANNEL_INFO, params);
	const mockChannel = mock<TextChannel>();
	mockChannel.name = params.name;
	return mockChannel;
};

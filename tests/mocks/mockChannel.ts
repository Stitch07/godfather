import { mergeDefault } from '@klasa/utils';
import { mock } from 'jest-mock-extended';
import GodfatherChannel from '@lib/extensions/GodfatherChannel';

const DEFAULT_CHANNEL_INFO = {
	name: 'Tester'
};

export interface MockUserParams {
	name: string;
}

export const createMockChannel = (params: MockUserParams = DEFAULT_CHANNEL_INFO) => {
	params = mergeDefault(DEFAULT_CHANNEL_INFO, params);
	const mockChannel = mock<GodfatherChannel>();
	mockChannel.name = params.name;
	return mockChannel;
};


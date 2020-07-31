import { mergeDefault } from '@klasa/utils';
import { mock } from 'jest-mock-extended';
import { KlasaUser } from 'klasa';

const DEFAULT_USER_INFO = {
	discriminator: '0000',
	username: 'Tester'
};

export interface MockUserParams {
	username?: string;
	discriminator?: string;
}

export const createMockUser = (params: MockUserParams = DEFAULT_USER_INFO) => {
	params = mergeDefault(DEFAULT_USER_INFO, params);
	const mockUser = mock<KlasaUser>();
	mockUser.username = params.username!;
	mockUser.discriminator = params.discriminator!;
	return mockUser;
};


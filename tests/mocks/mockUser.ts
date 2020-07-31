import { mergeDefault } from '@klasa/utils';
import { mock } from 'jest-mock-extended';
import { KlasaUser } from 'klasa';
import { createID } from './createID';

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
	// id is readonly so we cannot directly edit it
	Object.defineProperty(mockUser, 'id', { value: createID() });
	// getters show up as jest.fn(), we don't want that
	Object.defineProperty(mockUser, 'tag', {
		get() {
			return `${this.username}#${this.discriminator}`;
		}
	});
	return mockUser;
};


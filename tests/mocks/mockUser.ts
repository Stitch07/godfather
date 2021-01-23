import { mergeDefault } from '@sapphire/utilities';
import type { User } from 'discord.js';
import { mock } from 'jest-mock-extended';
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
  const mockUser = mock<User>();
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

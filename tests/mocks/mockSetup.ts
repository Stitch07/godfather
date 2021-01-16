import BasicSetup from '@root/lib/mafia/structures/BasicSetup';
import { mock } from 'jest-mock-extended';

interface MockSetupParams {
	roles: string[];
	nightStart?: boolean;
}

export const createMockSetup = (params: MockSetupParams) => {
	const setup = mock<BasicSetup>();
	setup.roles = params.roles;
	setup.nightStart = params.nightStart ?? false;

	return setup;
};

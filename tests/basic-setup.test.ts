import BasicSetup from '@mafia/BasicSetup';
import { init } from '@mafia/roles';
import Cop from '@mafia/roles/town/Cop';
import Vanilla from '@mafia/roles/town/Vanilla';

beforeAll(async () => {
	await init();
});

describe('different setup types', () => {

	test('basic role names', () => {
		const resolved = BasicSetup.resolve('Vanilla');
		console.log(resolved);
		expect(resolved instanceof Vanilla).toBe(true);
	});

	test('basic category names', () => {
		const resolved = BasicSetup.resolve('Random Town');
		console.log(resolved);
		expect(resolved instanceof Vanilla || resolved instanceof Cop).toBe(true);
	});

});

import BasicSetup from '@mafia/BasicSetup';
import { init } from '@mafia/roles';
import Cop from '@mafia/roles/town/Cop';
import Vanilla from '@mafia/roles/town/Vanilla';

beforeAll(async () => {
	await init();
});

const classExtends = (a: any, b: any) => Object.create(a.prototype) instanceof b;

describe('different setup types', () => {

	test('basic role names', () => {
		const resolved = BasicSetup.resolve('Vanilla');
		expect(classExtends(resolved, Vanilla)).toBe(true);
	});

	test('basic category names', () => {
		const resolved = BasicSetup.resolve('Random Town');
		expect(classExtends(resolved, Cop) || classExtends(resolved, Vanilla)).toBe(true);
	});

});

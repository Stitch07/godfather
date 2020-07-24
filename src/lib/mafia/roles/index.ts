import { basename, extname, parse } from 'path';
import { scan } from 'fs-nextra';
import { Constructor, Role } from '@klasa/core';

export const allRoles = new Map<string, Constructor<Role>>();

export const init = async () => {
	const scannedFiles = await scan('dist/lib/mafia/roles', {
		filter: (handle, path) => handle.isFile() && extname(path) === '.js' && basename(path, '.js') !== 'index'
	});
	for (const [filePath, file] of scannedFiles.entries()) {
		const roleClass = await import(filePath);
		const roleName = parse(file.name).name;
		allRoles.set(roleName, roleClass);
	}
};

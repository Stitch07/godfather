import { basename, extname, parse } from 'path';
import { scan } from 'fs-nextra';
import { Constructor } from '@klasa/core';
import Role from '@mafia/Role';

// A map of role names to the constructor of its corresponding role Class
export const allRoles = new Map<string, Constructor<Role>>();
// A map of role categories to an array of role constructors belonging to that category
export const roleCategories = new Map<string, Constructor<Role>[]>();

export const init = async () => {
	const scannedFiles = await scan('dist/lib/mafia/roles', {
		filter: (handle, path) => handle.isFile() && extname(path) === '.js' && basename(path, '.js') !== 'index'
	});
	for (const [filePath, file] of scannedFiles.entries()) {
		const { default: roleClass } = await import(filePath);
		// convert Role_Name to Role Name
		const roleName = parse(file.name).name.split('_').join(' ');
		allRoles.set(roleName, roleClass);
		// append to category array here
		for (const category of roleClass.categories as string[]) {
			const categoryArray = roleCategories.get(category) ?? ([] as Array<Constructor<Role>>);
			categoryArray.push(roleClass);
			roleCategories.set(category, categoryArray);
		}
	}
};

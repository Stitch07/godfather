import type Role from '@mafia/structures/Role';
import { Constructor, toTitleCase } from '@sapphire/utilities';
import { cast } from '@util/utils';
import { Collection } from 'discord.js';
import { scan } from 'fs-nextra';
import { basename, extname, parse } from 'path';

// A map of role names to the constructor of its corresponding role Class
export const allRoles = new Collection<string, Constructor<Role>>();
// A map of role categories to an array of role constructors belonging to that category
export const roleCategories = new Collection<string, Constructor<Role>[]>();

export const init = async () => {
  const scannedFiles = await scan('dist/lib/mafia/roles', {
    filter: (handle, path) => handle.isFile() && extname(path) === '.js' && basename(path, '.js') !== 'index'
  });
  for (const [filePath, file] of scannedFiles.entries()) {
    const { default: roleClass } = await import(filePath);
    // convert Role_Name to Role Name
    const roleName = parse(file.name).name.split('_').join(' ');
    allRoles.set(roleName, roleClass);
    // add role aliases (Vig, Consig)
    for (const alias of roleClass.aliases) {
      allRoles.set(cast<string>(alias), roleClass);
    }
    // append to category array here
    for (const category of roleClass.categories as string[]) {
      const categoryArray = roleCategories.get(category) ?? ([] as Array<Constructor<Role>>);
      if (!categoryArray.includes(roleClass)) categoryArray.push(roleClass);
      roleCategories.set(category, categoryArray);
    }
  }

  // add category aliases (RT for Random Town)
  for (const [category, roles] of roleCategories.entries()) {
    if (category.split(' ').length !== 2) continue;
    const alias = category
      .split(' ')
      .map((word) => toTitleCase(word[0]))
      .join('');
    roleCategories.set(alias, roles);
  }
};

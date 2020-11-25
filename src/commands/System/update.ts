/* eslint-disable @typescript-eslint/restrict-plus-operands */
/**
 * This command has been adapted from Skyra (https://github.com/skyra-project/skyra/blob/main/src/commands/System/Admin/update.ts)
 * Copyright 2019-2020 Antonio Román
 */
import { Args, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import { Message } from 'discord.js';
import { exec, sleep } from '@util/utils';
import { codeBlock, cutText } from '@sapphire/utilities';
import { resolve } from 'path';
import { rm } from 'fs/promises';

@ApplyOptions<CommandOptions>({
	preconditions: ['OwnerOnly'],
	strategyOptions: {
		flags: ['deps', 'd', 'clean']
	}
})
export default class extends GodfatherCommand {

	public async run(message: Message, args: Args) {
		const branchName = await args.rest('string').catch(() => 'master');
		// Fetch repository and pull if possible
		await this.fetch(message, branchName);
		// Update Yarn dependencies
		if (args.getFlags('deps', 'd')) await this.updateDependencies(message);
		// clean dist folder
		if (args.getFlags('clean')) await this.cleanDist(message);
		// Compile TypeScript to JavaScript
		await this.compile(message);
	}

	private async compile(message: Message) {
		const { stderr, code } = await this.exec('yarn build');
		if (code !== 0 && stderr.length) throw stderr.trim();
		return message.channel.send('Successfully compiled.');
	}

	private async cleanDist(message: Message) {
		await rm(resolve(process.cwd(), 'dist'), { recursive: true, force: true });
		return message.channel.send(`Successfully cleaned old dist directory.`);
	}

	private async updateDependencies(message: Message) {
		const { stderr, code } = await this.exec('yarn install --frozen-lockfile');
		if (code !== 0 && stderr.length) throw stderr.trim();
		return message.channel.send('Successfully updated dependencies.');
	}

	private async fetch(message: Message, branch: string) {
		await this.exec('git fetch');
		const { stdout, stderr } = await this.exec(`git pull origin ${branch} --rebase=false`);

		// If it's up to date, do nothing
		if (/already up(?: |-)to(?: |-)date/i.test(stdout)) throw 'Up to date.';

		// If it was not a successful pull, return the output
		if (!this.isSuccessfulPull(stdout)) {
			// If the pull failed because it was in a different branch, run checkout
			if (!(await this.isCurrentBranch(branch))) {
				return this.checkout(message, branch);
			}

			// If the pull failed because local changes, run a stash
			if (this.needsStash(stdout + stderr)) return this.stash(message);
		}

		// For all other cases, return the original output
		return message.channel.send(
			codeBlock('prolog', [cutText(stdout, 1800) || '✅', cutText(stderr, 100) || '✅'].join('\n-=-=-=-\n'))
		);
	}

	private async stash(message: Message) {
		await message.channel.send('Unsuccessful pull, stashing...');
		await sleep(1000);
		const { stdout, stderr } = await this.exec('git stash');
		if (!this.isSuccessfulStash(stdout + stderr)) {
			throw `Unsuccessful pull, stashing:\n\n${codeBlock('prolog', [stdout || '✔', stderr || '✔'].join('\n-=-=-=-\n'))}`;
		}

		return message.channel.send(codeBlock('prolog', [cutText(stdout, 1800) || '✔', cutText(stderr, 100) || '✔'].join('\n-=-=-=-\n')));
	}

	private async checkout(message: Message, branch: string) {
		await message.channel.send(`Switching to ${branch}...`);
		await this.exec(`git checkout ${branch}`);
		return message.channel.send(`Switched to ${branch}.`);
	}

	private async isCurrentBranch(branch: string) {
		const { stdout } = await this.exec('git symbolic-ref --short HEAD');
		return stdout === `refs/heads/${branch}\n` || stdout === `${branch}\n`;
	}

	private isSuccessfulPull(output: string) {
		return /\d+\s*file\s*changed,\s*\d+\s*insertions?\([+-]\),\s*\d+\s*deletions?\([+-]\)/.test(output);
	}

	private isSuccessfulStash(output: string) {
		return output.includes('Saved working directory and index state WIP on');
	}

	private needsStash(output: string) {
		return output.includes('Your local changes to the following files would be overwritten by merge');
	}

	private async exec(script: string) {
		try {
			const result = await exec(script);
			return { ...result, code: 0 };
		} catch (error) {
			return { stdout: '', stderr: error?.message || error || '', code: error.code ?? 1 };
		}
	}

}

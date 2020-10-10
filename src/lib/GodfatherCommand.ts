import { Command } from '@sapphire/framework';
import { sep } from 'path';

export default abstract class GodfatherCommand extends Command {

	public get category() {
		return this.path.split(sep).reverse()[1] ?? 'General';
	}

}

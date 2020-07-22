import { Command, CommandOptions, CommandStore } from 'klasa';
import Godfather from './Godfather';

export default abstract class GodfatherCommand extends Command {

	public declare client: Godfather
	public gameOnly?: boolean;
	public constructor(store: CommandStore, directory: string, files: string[], options: GodfatherCommandOptions) {
		super(store, directory, files, options as CommandOptions);
		this.gameOnly = options.gameOnly ?? false;
	}
}

export interface GodfatherCommandOptions extends CommandOptions {
	gameOnly?: boolean;
}

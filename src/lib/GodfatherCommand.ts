import { Command, CommandOptions, CommandStore } from 'klasa';
import Godfather from './Godfather';

export default abstract class GodfatherCommand extends Command {

	public declare client: Godfather;
	public gameOnly: boolean;
	public hostOnly: boolean;
	public gameStartedOnly: boolean;
	public playerOnly: boolean;
	public alivePlayerOnly: boolean;
	public constructor(store: CommandStore, directory: string, files: string[], options: GodfatherCommandOptions) {
		super(store, directory, files, options as CommandOptions);
		this.gameOnly = options.gameOnly ?? false;
		this.hostOnly = options.hostOnly ?? false;
		this.playerOnly = options.playerOnly ?? false;
		this.alivePlayerOnly = options.alivePlayerOnly ?? false;
		this.gameStartedOnly = options.gameStartedOnly ?? false;
	}

}

export interface GodfatherCommandOptions extends CommandOptions {
	gameOnly?: boolean;
	hostOnly?: boolean;
	gameStartedOnly?: boolean;
	playerOnly?: boolean;
	alivePlayerOnly?: boolean;
}

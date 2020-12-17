import fetch from 'node-fetch';
import { CLIENT_ID, TOKEN } from '../config';

const COMMAND_PAYLOAD = [
	{
		name: 'invite',
		description: 'Get an invite link to Godfather.'
	},
	{
		name: 'playerlist',
		description: 'Shows you the playerlist of an ongoing game.'
	},
	{
		name: 'votecount',
		description: 'Shows you the vote-count of an ongoing game.'
	}
];

async function run() {
	const endpoint = `https://discord.com/api/v8/applications/${CLIENT_ID}/commands`;
	for (const command of COMMAND_PAYLOAD) {
		const response = await fetch(endpoint, {
			method: 'POST',
			body: JSON.stringify(command),
			headers: {
				'Authorization': `Bot ${TOKEN}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to add command ${command.name}`);
		}
	}
}

run().catch(console.error);

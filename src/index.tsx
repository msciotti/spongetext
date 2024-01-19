import { InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions';

export interface Env {
}

export default {
	async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
		const signature = request.headers.get('X-Signature-Ed25519');
		const timestamp = request.headers.get('X-Signature-Timestamp');
		const rawBody = await request.clone().text();
		//@ts-ignore
		const isValidRequest = verifyKey(rawBody, signature, timestamp, env.DISCORD_PUBLIC_KEY);

		if (!isValidRequest) {
			return new Response('Invalid signture', { status: 401 });
		}

		const json = await request.json();
		let response;

		if (json.type === InteractionType.PING) {
			const response = JSON.stringify({
				type: InteractionResponseType.PONG
			});
			return new Response(response);
		}

		let input = '';

		if (!!json.data.options) {
			input = json.data.options[0]['value'];
		}
		else if (!!json.data.target_id) {
			const message_id = json.data.target_id;
			input = json.data.resolved.messages[message_id].content
		}

		let newText = '';

		for (let i = 0; i < input.length; i++) {
			newText += (i % 2 == 0 ? input.charAt(i).toLowerCase() : input.charAt(i).toUpperCase());
		}

		if (json.type === InteractionType.APPLICATION_COMMAND) {
			if (json.data.name === 'spongetext' || json.data.name === 'Spongify') {
				response = {
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: `${newText}[.](https://uploads.dailydot.com/57f/6c/9055ebfa31c8550e-e1494349501884.jpg?q=65&auto=format&w=2270&ar=2:1&fit=crop)`
					}
				}
			}
		}

		return new Response(JSON.stringify(response), {
			headers: {
				'Content-type': 'application/json'
			}
		});
	}
}

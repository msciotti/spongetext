import { InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
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

		const input = json.data.options[0]['value'];
		console.log(json.data);
		let newText = '';

		for (let i = 0; i < input.length; i++) {
			newText += (i % 2 == 0 ? input.charAt(i).toLowerCase() : input.charAt(i).toUpperCase());
		}

		if (json.type === InteractionType.APPLICATION_COMMAND) {
			if (json.data.name === 'spongetext') {
				response = {
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: `${newText}[.](https://uploads.dailydot.com/57f/6c/9055ebfa31c8550e-e1494349501884.jpg?q=65&auto=format&w=2270&ar=2:1&fit=crop)`
					}
				}
			}

			//photo command id: 1164236010452959342
			else {
				response = {
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: 'Fail'
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

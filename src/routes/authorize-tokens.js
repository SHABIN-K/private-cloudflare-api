import bs58 from "bs58";
import { verifyAsync } from "@noble/ed25519";
import { Connection } from "@solana/web3.js";

const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

export async function onRequestPost({ request }) {
	try {
		const body = await request.json();
		const { ata, message, signature, wallet, nonce, timestamp } = body;

		const isValid = await verifyAsync(
			bs58.decode(signature),
			new TextEncoder().encode(message),
			bs58.decode(wallet)
		);

		if (!isValid) {
			return new Response(JSON.stringify({ error: "Invalid signature" }), {
				status: 401,
			});
		}

		if (!Array.isArray(ata) || ata.length === 0) {
			return new Response(
				JSON.stringify({ error: "No token accounts provided" }),
				{ status: 400 }
			);
		}

		const connection = new Connection(SOLANA_RPC);

		// TODO: Verify the signature (important!)
		// await verifySignature(body.accounts, body.signature);

		// TODO: Proceed with token closing logic

		return new Response(
			JSON.stringify({ success: true, message: "Tokens closed." }),
			{ status: 200 }
		);
	} catch (err) {
		console.log(err);
		return new Response(
			JSON.stringify({ error: "Internal server error", details: err.message }),
			{ status: 500 }
		);
	}
}

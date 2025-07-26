export async function onRequestPost({ request }) {
	try {
		const body = await request.json();

		// // Validate incoming data (basic check)
		// if (!Array.isArray(body.accounts) || !body.signature) {
		// 	return new Response(JSON.stringify({ error: "Invalid request body" }), {
		// 		status: 400,
		// 		headers: { "Content-Type": "application/json" },
		// 	});
		// }

		// TODO: Verify the signature (important!)
		// await verifySignature(body.accounts, body.signature);

		// TODO: Proceed with token closing logic

		return new Response(
			JSON.stringify({ success: true, message: "Tokens closed." }),
			{ status: 200, headers: { "Content-Type": "application/json" } }
		);
	} catch (err) {
		return new Response(
			JSON.stringify({ error: "Internal server error", details: err.message }),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}

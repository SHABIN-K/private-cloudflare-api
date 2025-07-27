import bs58 from "bs58";
import { verifyAsync } from "@noble/ed25519";
import { Connection } from "@solana/web3.js";

const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
const MAX_TIMESTAMP_DIFF = 60 * 1000;

export async function onRequestPost({ request }) {
  try {
    const body = await request.json();
    const { ata, message, signature, wallet, nonce, timestamp } = body;

    if (!ata || !Array.isArray(ata) || ata.length === 0) {
      return new Response(JSON.stringify({ error: "No token accounts provided" }), {
        status: 400,
      });
    }

    if (!wallet || !signature || !message || !timestamp || !nonce) {
      return new Response(JSON.stringify({ error: "Missing fields in request" }), {
        status: 400,
      });
    }

    const now = Date.now();
    const timestampInt = parseInt(timestamp);
    if (isNaN(timestampInt) || Math.abs(now - timestampInt) > MAX_TIMESTAMP_DIFF) {
      return new Response(JSON.stringify({ error: "Timestamp too old or invalid" }), {
        status: 403,
      });
    }

    const isValid = await verifyAsync(bs58.decode(signature), new TextEncoder().encode(message), bs58.decode(wallet));

    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Requested tokens verified. Cleanup initiated (mock).",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ error: "Internal server error", details: err.message }), { status: 500 });
  }
}

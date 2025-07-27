import bs58 from "bs58";
import { verifyAsync } from "@noble/ed25519";
import { Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
const MAX_TIMESTAMP_DIFF = 60 * 1000;
const NONCE_TTL_SECONDS = 60;

export async function onRequestPost({ request, env }) {
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

    // Timestamp check
    const now = Date.now();
    const timestampInt = parseInt(timestamp);
    if (isNaN(timestampInt) || Math.abs(now - timestampInt) > MAX_TIMESTAMP_DIFF) {
      return new Response(
        JSON.stringify({ error: "Timestamp too old or invalid,Please generate a new valid message and try again." }),
        { status: 403 }
      );
    }

    // Replay protection: check nonce in KV
    const nonceKey = `nonce:${wallet}:${nonce}`;
    const existingNonce = await env.NONCE_CACHE.get(nonceKey);
    if (existingNonce) {
      return new Response(
        JSON.stringify({ error: "The provided nonce has already been used,Please generate a new valid message and try again." }),
        { status: 403 }
      );
    }

    const publicKey = new PublicKey(wallet).toBytes();
    const isValid = await verifyAsync(bs58.decode(signature), new TextEncoder().encode(message), publicKey);
  
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
      });
    }

    await env.NONCE_CACHE.put(nonceKey, "used", { expirationTtl: NONCE_TTL_SECONDS });

    return new Response(JSON.stringify({ message: "Requested tokens verified. Cleanup initiated (mock)." }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error", details: err.message }), { status: 500 });
  }
}

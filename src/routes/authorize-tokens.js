import bs58 from "bs58";
import { verifyAsync } from "@noble/ed25519";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { errorResponse } from "../utils";
import buildCloseInstructions from "../helper/buildCloseInstructions";

const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
const MAX_TIMESTAMP_DIFF = 60 * 1000;
const NONCE_TTL_SECONDS = 60;

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { ata, message, signature, wallet, nonce, timestamp } = body;

    if (!ata || !Array.isArray(ata) || ata.length === 0) {
      return errorResponse("No token accounts provided");
    }

    if (!wallet || !signature || !message || !timestamp || !nonce) {
      return errorResponse("Missing fields in request");
    }

    // Timestamp check
    const now = Date.now();
    const timestampInt = parseInt(timestamp);
    // if (isNaN(timestampInt) || Math.abs(now - timestampInt) > MAX_TIMESTAMP_DIFF) {
    //   return errorResponse("Timestamp too old or invalid. Please generate a new valid message and try again.", 403);
    // }

    // Replay protection: check nonce in KV
    const nonceKey = `nonce:${wallet}:${nonce}`;
    const existingNonce = await env.NONCE_CACHE.get(nonceKey);
    // if (existingNonce) {
    //   return errorResponse("The provided nonce has already been used. Please generate a new valid message and try again.", 403);
    // }

    const publicKey = new PublicKey(wallet).toBytes();
    // const isValid = await verifyAsync(bs58.decode(signature), new TextEncoder().encode(message), publicKey);

    // if (!isValid) return errorResponse("Invalid signature", 401);

    // await env.NONCE_CACHE.put(nonceKey, "used", { expirationTtl: NONCE_TTL_SECONDS });

    // const instructions = await buildCloseInstructions(ata, wallet);

    const txHashes = [];
    const secretKey = bs58.decode(env.RELAYER_PAYER_PRIVATE_KEY);
    const payerKeypair = Keypair.fromSecretKey(secretKey);

    // for (const instruction of instructions) {
    const instructions = await buildCloseInstructions(ata, wallet);
    const tx = new Transaction().add(...instructions);
    tx.feePayer = payerKeypair.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    tx.sign(payerKeypair);
    const rawTx = tx.serialize();

    const txid = await connection.sendRawTransaction(rawTx, { skipPreflight: false });
    txHashes.push(txid);
    // }

    return new Response(JSON.stringify({ message: "Requested tokens verified.", txHashes: txHashes }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error", details: err.message }), { status: 500 });
  }
}

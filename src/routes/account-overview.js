import getUnverifiedTokenSubset from "../helper/getUnverifiedTokenSubset";
import { spoofedHeaders, rentPerAccountLamports } from "../utils";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const wallet = url.searchParams.get("wallet");

  if (!wallet) return new Response("Missing wallet address", { status: 400 });

  try {
    const solscanUrl = `https://api-v2.solscan.io/v2/account/tokenaccounts?address=${wallet}&page=1&page_size=100&type=token&hide_zero=false`;

    const response = await fetch(solscanUrl, {
      method: "GET",
      headers: spoofedHeaders,
    });

    if (!response.ok) {
      return new Response("[API_ERROR_THIRD]", {
        status: response.status,
      });
    }

    const { data, metadata } = await response.json();

    const tokenAccounts = data?.tokenAccounts || [];
    const totalAccounts = data.count;
    const hasMoreTokens = totalAccounts > 3000;
    const totalSOL = (totalAccounts * rentPerAccountLamports) / 1_000_000_000;

    const unverifiedTokens = getUnverifiedTokenSubset(tokenAccounts, metadata?.tokens);

    const tokens = unverifiedTokens.map(acc => {
      return {
        mint: acc.tokenAddress,
        symbol: acc.tokenSymbol || "???",
        name: acc?.tokenName || "Unknown",
        logoURI: acc?.tokenIcon || null,
        amount: acc.balance,
        tokenAccountAddress: acc.address,
      };
    });

    return new Response(
      JSON.stringify({
        solBalance: totalSOL,
        totalAccounts,
        hasMoreTokens,
        tokens,
      })
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error", details: err.message }), { status: 500 });
  }
}

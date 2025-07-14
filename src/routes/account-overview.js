import getUnverifiedTokenSubset from "../helper/getUnverifiedTokenSubset";

const rentPerAccountLamports = 2039280;

const spoofedHeaders = {
	Referer: "https://solscan.io/",
	Origin: "https://solscan.io",
	"User-Agent":
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
	Accept: "application/json, text/plain, */*",
	"Accept-Language": "en-US,en;q=0.9",
	"Accept-Encoding": "gzip, deflate, br",
	Connection: "keep-alive",
	Host: "api-v2.solscan.io",
	"X-Requested-With": "XMLHttpRequest",
	"Sec-Fetch-Site": "same-origin",
	"Sec-Fetch-Mode": "cors",
};

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

		const unverifiedTokens = getUnverifiedTokenSubset(
			tokenAccounts,
			metadata?.tokens
		);

		const tokens = unverifiedTokens.map((acc) => {
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
		return new Response(
			JSON.stringify({ error: "Internal server error", details: err.message }),
			{ status: 500 }
		);
	}
}

import response from "../cache/res.json";
import classifyTokenAccounts from "../helper/getClassifeidToken";
import { spoofedHeaders, rentPerAccountLamports } from "../utils";

export async function onRequestGet({ request, env }) {
	const url = new URL(request.url);
	const wallet = url.searchParams.get("wallet");

	if (!wallet) return new Response("Missing wallet address", { status: 400 });

	try {
		const solscanUrl = `https://api-v2.solscan.io/v2/account/tokenaccounts?address=${wallet}&page=1&page_size=480&type=token&hide_zero=false`;

		const response = await fetch(solscanUrl, {
			method: "GET",
			headers: spoofedHeaders,
		});

		if (!response.ok) {
			return new Response("[API_ERROR_THIRD]", {
				status: response.status,
			});
		}
		// const { data, metadata } = response;
		const { data, metadata } = await response.json();

		const {
			zeroBalanceAccounts,
			burnCandidateAccounts: BurnATA,
			finalVerifiedAccounts,
		} = classifyTokenAccounts(data?.tokenAccounts, metadata?.tokens);

		const totalAccounts = data.count;
		const burnCandidateAccountsCount =
			BurnATA.fullData.length + BurnATA.ataOnly.length;

		const result = {
			rentPerAccountLamports,
			totalAccounts,
			zeroBalanceAccountsCount: zeroBalanceAccounts.length,
			burnCandidateAccountsCount,
			finalVerifiedAccountsCount: finalVerifiedAccounts.length,
			zeroBalanceAccounts,
			BurnATA,
			finalVerifiedAccounts,
		};

		return new Response(JSON.stringify(result));
	} catch (err) {
		return new Response(
			JSON.stringify({ error: "Internal server error", details: err.message }),
			{ status: 500 }
		);
	}
}

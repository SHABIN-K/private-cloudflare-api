import { rentPerAccountLamports } from "../utils";
import { getBatchTokenAccounts } from "../helper/gettokenaccounts";
import classifyTokenAccounts from "../helper/getClassifeidToken";

export async function onRequestGet({ request, env }) {
	const url = new URL(request.url);
	const wallet = url.searchParams.get("wallet");

	if (!wallet) return new Response("Missing wallet address", { status: 400 });

	try {
		const res = await getBatchTokenAccounts(wallet);

		const { tokenCount, tokens, metadata: ds } = res;
		
		return new Response(JSON.stringify({ Hel: "hello world" }));

		// const { data, metadata } = res;

		// const {
		// 	zeroBalanceAccounts,
		// 	burnCandidateAccounts: BurnATA,
		// 	finalVerifiedAccounts,
		// 	verifiedMintCount,
		// } = classifyTokenAccounts(data?.tokenAccounts, metadata?.tokens);

		// const totalAccounts = data.count;
		// const burnCandidateAccountsCount =
		// 	BurnATA.fullData.length + BurnATA.ataOnly.length;

		// const result = {
		// 	rentPerAccountLamports,
		// 	totalAccounts: totalAccounts - verifiedMintCount,
		// 	zeroBalanceAccountsCount: zeroBalanceAccounts.length,
		// 	burnCandidateAccountsCount,
		// 	finalVerifiedAccountsCount: finalVerifiedAccounts.length,
		// 	zeroBalanceAccounts,
		// 	BurnATA,
		// 	finalVerifiedAccounts,
		// };

		// return new Response(JSON.stringify(result));
	} catch (err) {
		return new Response(
			JSON.stringify({ error: "Internal server error", details: err.message }),
			{ status: 500 }
		);
	}
}

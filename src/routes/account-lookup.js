import { rentPerAccountLamports } from "../utils";
import { getBatchTokenAccounts } from "../helper/gettokenaccounts";
import classifyTokenAccounts from "../helper/getClassifeidToken";

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const wallet = url.searchParams.get("wallet");

  if (!wallet) return new Response("Missing wallet address", { status: 400 });

  try {
    const { totalAccounts, tokenAccounts, metadata } = await getBatchTokenAccounts(wallet);

    const {
      zeroBalanceAccounts,
      burnCandidateAccounts: BurnATA,
      finalVerifiedAccounts,
      verifiedMintCount,
    } = classifyTokenAccounts(tokenAccounts, metadata);

    const burnTokenAccCount = BurnATA.fullData.length + BurnATA.ataOnly.length;
    const hasMoreData = tokenAccounts.length < totalAccounts;

    const result = {
      rentPerAccountLamports,
      totalAccounts: totalAccounts - verifiedMintCount,
      zeroBalanceAccCount: zeroBalanceAccounts.length,
      burnTokenAccCount,
      VerifiedAccCount: finalVerifiedAccounts.length,
      zeroBalanceAccounts,
      BurnATA,
      VerifiedAccounts: finalVerifiedAccounts,
      hasMoreData,
    };

    return new Response(JSON.stringify(result));
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error", details: err.message }), { status: 500 });
  }
}

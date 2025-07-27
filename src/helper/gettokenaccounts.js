import { spoofedHeaders } from "../utils";

const getTokenAccounts = async (wallet, currentPage, pageSize) => {
  const isMaxPage = currentPage === 5 ? 100 : pageSize;
  const solscanUrl = `https://api-v2.solscan.io/v2/account/tokenaccounts?address=${wallet}&page=${currentPage}&page_size=${isMaxPage}&type=token&hide_zero=false`;

  try {
    const response = await fetch(solscanUrl, {
      method: "GET",
      headers: spoofedHeaders,
    });

    if (!response.ok) {
      throw new Error("[API_ERROR_THIRD]");
    }

    return await response.json();
  } catch (err) {
    throw new Error("[API_ERROR_THIRD]");
  }
};

export const getBatchTokenAccounts = async wallet => {
  let tokenCount = null;
  let tokens = [];
  let meta = {};

  let currentPage = 1;
  let pageSize = 480;
  let hasMore = true;
  let dataType = "indexed";

  while (hasMore && dataType === "indexed" && currentPage <= 5) {
    const { data, metadata } = await getTokenAccounts(wallet, currentPage, pageSize);
    const pageTokens = data?.tokenAccounts || [];
    if (!tokenCount) tokenCount = data?.count;
    dataType = data?.data_type || "indexed";

    tokens.push(...pageTokens);
    Object.assign(meta, metadata?.tokens);

    if (pageTokens.length < pageSize) hasMore = false;

    currentPage++;
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return {
    totalAccounts: tokenCount,
    tokenAccounts: tokens,
    metadata: meta,
    currentPage,
  };
};

import getRandomSubset from "../utils/getRandomSubset";

/**
 * Filters a random subset of unverified tokens from the user's token accounts.
 *
 * 📌 Purpose:
 * This function is designed to quickly select up to 15 tokens from a user's portfolio
 * that are not "verified" (i.e., not high-profile tokens like USDC, WSOL, etc.).
 * It ensures that verified tokens (based on metadata) are excluded from the result.
 *
 * 🔍 How it works:
 * 1. Randomly selects tokens from the full list of accounts.
 * 2. Skips any previously selected (tracked via index) to avoid duplication.
 * 3. Filters out tokens marked as "verified" using metadata:
 *    - `meta.reputation === "ok"`
 * 4. Repeats the process until:
 *    - 15 unverified tokens are collected, OR
 *    - All tokens have been considered (ensuring performance).
 * 5. If fewer than 15 unverified tokens are found, it returns whatever was collected.
 *
 * 🧠 Why:
 * Instead of wasting API time and performance fetching details for well-known tokens,
 * we focus on identifying low-value or spam tokens that users may want to ignore or burn.
 *
 * @param {Array} tokenAccounts - Full list of token accounts returned from Solana/Solscan.
 * @param {Object} metadata - Key-value map of tokenAddress -> metadata (includes reputation info).
 * @param {number} [targetCount=15] - Maximum number of unverified tokens to return.
 * @returns {Array} Array of unverified token accounts (up to 15 or less if not enough).
 */
function getUnverifiedTokenSubset(tokenAccounts, metadata, targetCount = 15) {
	const selected = [];
	const seenIndexes = new Set();

	// Step 1: keep selecting random tokens until we collect 15 unverified or run out
	while (
		selected.length < targetCount &&
		seenIndexes.size < tokenAccounts.length
	) {
		// pick random tokens that haven’t been seen
		const remaining = tokenAccounts.filter((_, i) => !seenIndexes.has(i));
		if (remaining.length === 0) break;

		const needed = targetCount - selected.length;
		const sample = getRandomSubset(remaining, needed);

		for (const acc of sample) {
			const index = tokenAccounts.indexOf(acc);
			seenIndexes.add(index);

			const meta = metadata[acc.tokenAddress];
			const isVerified = meta?.reputation === "ok";

			if (!isVerified) {
				selected.push(acc);
			}

			if (selected.length === targetCount) break;
		}
	}

	return selected; // ✅ may return less than 15 if no more unverified
}

export default getUnverifiedTokenSubset;

import * as accountOverview from "./routes/account-overview.js";
import * as accountLookup from "./routes/account-lookup.js";
import * as authorizeTokens from "./routes/authorize-tokens.js";

const routeMap = {
	"/account-overview": accountOverview,
	"/account-lookup": accountLookup,
	"/authorize-tokens": authorizeTokens,
};

export function getHandler(pathname) {
	return routeMap[pathname] || null;
}

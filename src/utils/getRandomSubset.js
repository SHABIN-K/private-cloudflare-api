const getRandomSubset = (arr, count) => {
	const shuffled = [...arr].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
};

export default getRandomSubset;

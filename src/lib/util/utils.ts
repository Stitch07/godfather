export const shuffle = <T>(array: readonly T[]): T[] => {
	const clone = array.slice();
	const shuffled = [];

	for (const { } of array) {
		const [value] = clone.splice(Math.floor(Math.random() * clone.length), 1);
		shuffled.push(value);
	}

	return shuffled;
};

export const randomArray = <T>(array: readonly T[]): T => array[Math.floor(Math.random() * array.length)];

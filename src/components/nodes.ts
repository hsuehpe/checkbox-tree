const genNodes = () => {
	return new Array(100).fill(0).map((value, index) => {
		const node = {
			value: `index-${index}`,
			label: `Index ${index}`,
		};
		return node;
	});
};

export const nodes = [
	{
		value: "mars",
		label: "Mars",
		children: [
			{ value: "phobos", label: "Phobos" },
			{ value: "deimos", label: "Deimos" },
			{
				value: "potato",
				label: "Potato",
				children: [
					{ value: "bird", label: "Bird" },
					{ value: "cat", label: "Cat" },
					{
						value: "dog",
						label: "Dog",
						children: [
							{ value: "puppy", label: "Puppy" },
							{ value: "kitten", label: "Kitten" },
							{
								value: "Human",
								label: "human",
							},
						],
					},
				],
			},
		],
	},
	{
		value: "mars-2",
		label: "Mars-2",
		children: [
			{ value: "phobos-2", label: "Phobos-2" },
			{ value: "deimos-2", label: "Deimos-2" },
		],
	},
];

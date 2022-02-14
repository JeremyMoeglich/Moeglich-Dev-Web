const config = {
	plugins: [
		//Some plugins, like tailwindcss/nesting, need to run before Tailwind,
		require('tailwindcss')(),
		require('tailwindcss/nesting')(require('postcss-nesting')),
		//But others, like autoprefixer, need to run after,
		require('autoprefixer')
	]
};

module.exports = config;

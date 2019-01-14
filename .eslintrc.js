module.exports = {
	root: true,
	env: {
		node: true
	},

	extends: ['airbnb-base'],

	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		indent: [2, 'tab', { SwitchCase: 1 }],
		'no-tabs': 0,
		'comma-dangle': 0,
		'operator-linebreak': 0,
		'no-mixed-operators': 0,
		'arrow-parens': 0,
		'import/extensions': 0,
		'no-new': 0,
		'no-plusplus': 0,
		'class-methods-use-this': 0,
		'no-use-before-define': 0,
		'no-shadow': 0,
		'no-restricted-globals': 0
	}
};

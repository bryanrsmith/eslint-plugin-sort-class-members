import { memberOrder } from './rules/member-order';

// use commonjs default export so ESLint can find the rule
module.exports = {
	rules: {
		'member-order': memberOrder,
	},
	rulesConfig: {
		'member-order': 0,
	},
};

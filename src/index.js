import { sortClassMembers } from './rules/sort-class-members';

// use commonjs default export so ESLint can find the rule
module.exports = {
	rules: {
		'sort-class-members': sortClassMembers.getRule(),
	},
	rulesConfig: {
		'sort-class-members': [0, {
			order: [
				'[static-properties]',
				'[static-methods]',
				'[properties]',
				'[conventional-private-properties]',
				'constructor',
				'[methods]',
				'[conventional-private-methods]',
			],
		}],
	},
};

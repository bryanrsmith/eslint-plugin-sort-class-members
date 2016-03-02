import { sortClassMembers } from './rules/sort-class-members';

// use commonjs default export so ESLint can find the rule
module.exports = {
	rules: {
		'sort-class-members': sortClassMembers.getRule(),
	},
	configs: {
		recommended: {
			rules: {
				'sort-class-members/sort-class-members': [ 2, {
					order: [
						'[static-properties]',
						'[static-methods]',
						'[properties]',
						'[conventional-private-properties]',
						'constructor',
						'[methods]',
						'[conventional-private-methods]',
					],
					accessorPairPositioning: 'getThenSet',
				}],
			},
		},
	},
};

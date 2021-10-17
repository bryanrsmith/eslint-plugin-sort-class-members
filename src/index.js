import { sortClassMembersRule } from './rules/sort-class-members';

// use commonjs default export so ESLint can find the rule
module.exports = {
	rules: {
		'sort-class-members': sortClassMembersRule,
	},
	configs: {
		recommended: {
			plugins: ['sort-class-members'],
			rules: {
				'sort-class-members/sort-class-members': [
					2,
					{
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
					},
				],
			},
		},
	},
};

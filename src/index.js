import { sortClassMembers } from './rules/sort-class-members';

// use commonjs default export so ESLint can find the rule
module.exports = {
	rules: {
		'sort-class-members': sortClassMembers.getRule(),
	},
};

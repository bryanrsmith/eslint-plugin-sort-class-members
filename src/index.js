import * as pkg from '../package.json';
import { sortClassMembersRule } from './rules/sort-class-members';

const plugin = {
	meta: {
		name: pkg.name,
		version: pkg.version,
	},
	configs: {},
	rules: { 'sort-class-members': sortClassMembersRule },
};

const rules = {
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
};

plugin.configs.recommended = {
	plugins: ['sort-class-members'],
	rules,
};

plugin.configs['flat/recommended'] = {
	plugins: { 'sort-class-members': plugin },
	rules,
};

module.exports = plugin;

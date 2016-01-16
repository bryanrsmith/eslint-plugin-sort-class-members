import eslint from 'eslint';
import { sortClassMembers } from '../../src/rules/sort-class-members';

let ruleTester = new eslint.RuleTester({ env: { es6: true }});

let regexpOptions = [{
	order: [
		'before',
		'/ab.+/',
		'after',
		'[everything-else]',
	],
}];

let customGroupOptions = [{
	order: [
		'constructor',
		'[event-handlers]',
		'[everything-else]',
	],
	groups: {
		'event-handlers': { type: 'method', name: '/on.+/' },
	},
}];

let objectOrderOptions = [{
	order: [
		{ type: 'method' },
		{ type: 'property', name: '/_.+' },
		{ type: 'method', static: true },
	],
}];

ruleTester.run('sort-class-members', sortClassMembers, {
	valid: [
		{ code: 'class A {}' },
		{ code: 'class A { static beforeCtor(){} constructor(){} }' },
		{ code: 'class A { static beforeCtor(){} constructor(){} afterCtor(){} }' },
		{ code: 'class A { constructor(){} afterCtor(){} }' },
		{ code: 'class A { constructor(){} afterCtor(){} other(){} }' },
		{ code: 'class A { static a; static b(){} c; _d; constructor(){} e(){} }', parser: 'babel-eslint' },

		// class properties should work with babel-eslint
		{ code: 'class A { static bar = 1; constructor(){} }', parser: 'babel-eslint' },
		{ code: 'class A { bar = 1; constructor(){} }', parser: 'babel-eslint' },

		// regexp names
		{ code: 'class A { before(){} abc(){} after(){} }', options: regexpOptions },
		{ code: 'class A { before(){} abc(){} after(){} xyz(){} }', options: regexpOptions },

		// custom groups
		{ code: 'class A { constructor(){} onClick(){} }', options: customGroupOptions },
		{ code: 'class A { onClick(){} abc(){} }', options: customGroupOptions },
		{ code: 'class A { constructor(){} onClick(){} onChange(){} prop; }', parser: 'babel-eslint', options: customGroupOptions },

		// object config options
		{ code: 'class A { a(){} _p; static b(){} }', parser: 'babel-eslint', options: objectOrderOptions },
	],
	invalid: [
		{
			code: 'class A { constructor(){} static beforeCtor(){} }',
			errors: [
				{
					message: 'Expected static method beforeCtor to come before constructor.',
					type: 'MethodDefinition',
				},
			],
		},
		{
			code: 'class A { constructor(){} _other(){} afterCtor(){} }',
			errors: [
				{
					message: 'Expected method afterCtor to come before method _other.',
					type: 'MethodDefinition',
				},
			],
		},
		{
			code: 'class A { _afterCtor(){} constructor(){} }',
			errors: [
				{
					message: 'Expected constructor to come before method _afterCtor.',
					type: 'MethodDefinition',
				},
			],
		},
		{
			code: 'class A { constructor(){} bar; }',
			errors: [
				{
					message: 'Expected property bar to come before constructor.',
					type: 'ClassProperty',
				},
			],
			parser: 'babel-eslint',
		},
		{
			code: 'class A { constructor(){} static bar; }',
			errors: [
				{
					message: 'Expected static property bar to come before constructor.',
					type: 'ClassProperty',
				},
			],
			parser: 'babel-eslint',
		},
		// regexp groups
		{
			code: 'class A { abc(){} before(){} after(){} }',
			errors: [
				{
					message: 'Expected method before to come before method abc.',
					type: 'MethodDefinition',
				},
			],
			options: regexpOptions,
		},
		// [everything-else] group
		{
			code: 'class A { xyz(){} before(){} after(){}; }',
			errors: [
				{
					message: 'Expected method before to come before method xyz.',
					type: 'MethodDefinition',
				},
				{
					message: 'Expected method after to come before method xyz.',
					type: 'MethodDefinition',
				},
			],
			options: regexpOptions,
		},
		// custom group options
		{
			code: 'class A { onClick(){} constructor(){} }',
			errors: [
				{
					message: 'Expected constructor to come before method onClick.',
					type: 'MethodDefinition',
				},
			],
			options: customGroupOptions,
		},
	],
});


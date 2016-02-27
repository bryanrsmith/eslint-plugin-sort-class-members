import eslint from 'eslint';
import plugin from '../../src';

let rule = plugin.rules['sort-class-members'];
let defaultOptions = [ plugin.configs.recommended.rules['sort-class-members'][1] ];

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
		'[event-handlers]',
		'constructor',
		'[everything-else]',
	],
	groups: {
		'event-handlers': [{ type: 'method', name: '/on.+/' }],
	},
}];

let objectOrderOptions = [{
	order: [
		{ type: 'method' },
		{ type: 'property', name: '/_.+' },
		{ type: 'method', static: true },
	],
}];

let nestedGroupOptions = [{
	order: [ 'a', '[outer]', 'd' ],
	groups: {
		'outer': [ 'b', '[inner]' ],
		'inner': [ 'c' ],
	},
}];

let stopAfterFirstOptions = [{
	order: [ 'a', 'b', 'c' ],
	stopAfterFirstProblem: true,
}];

let accessorOptions = [{
	order: [
		{ kind: 'get' },
		{ kind: 'set' },
		{ accessorPair: true },
		'[everything-else]',
	],
}];

ruleTester.run('sort-class-members', rule, {
	valid: [
		{ code: 'class A {}', options: defaultOptions },
		{ code: 'class A { static beforeCtor(){} constructor(){} }', options: defaultOptions },
		{ code: 'class A { static beforeCtor(){} constructor(){} afterCtor(){} }', options: defaultOptions },
		{ code: 'class A { constructor(){} afterCtor(){} }', options: defaultOptions },
		{ code: 'class A { constructor(){} afterCtor(){} other(){} }', options: defaultOptions },
		{ code: 'class A { static a = 1; static b(){} c = 2; _d = 3; constructor(){} e(){} }', parser: 'babel-eslint', options: defaultOptions },

		// class properties should work with babel-eslint
		{ code: 'class A { static bar = 1; constructor(){} }', parser: 'babel-eslint', options: defaultOptions },
		{ code: 'class A { bar = 1; constructor(){} }', parser: 'babel-eslint', options: defaultOptions },

		// regexp names
		{ code: 'class A { before(){} abc(){} after(){} }', options: regexpOptions },
		{ code: 'class A { before(){} abc(){} after(){} xyz(){} }', options: regexpOptions },

		// custom groups
		{ code: 'class A { onClick(){} constructor(){} }', options: customGroupOptions },
		{ code: 'class A { onClick(){} abc(){} }', options: customGroupOptions },
		{ code: 'class A { onClick(){} onChange(){} constructor(){} prop; }', parser: 'babel-eslint', options: customGroupOptions },

		// object config options
		{ code: 'class A { a(){} _p = 1; static b(){} }', parser: 'babel-eslint', options: objectOrderOptions },

		// nested groups
		{ code: 'class A { a(){} b(){} c(){} d(){} }', options: nestedGroupOptions },

		// undefined groups
		{ code: 'class A { a(){} b(){} }', options: [{ order: [ 'a', '[blah]', 'b' ]}]},

		// accessors
		{ code: 'class A { get a(){} }', options: accessorOptions },
		{ code: 'class A { get a(){} set a(v){} }', options: accessorOptions },
		{ code: 'class A { set a(v){} }', options: accessorOptions },
		{ code: 'class A { get a(){} b(){} }', options: accessorOptions },
		{ code: 'class A { get a(){} set a(v){} }', options: [{ order: [ 'everything-else' ], accessorPairPositioning: 'getThenSet' }]},
		{ code: 'class A { get a(){} set b(v){} get b(){} }', options: [{ order: [ 'everything-else' ], accessorPairPositioning: 'together' }]},
		{ code: 'class A { get a(){} set b(v){} get b(){} }', options: [{ order: [ 'everything-else' ], accessorPairPositioning: 'setThenGet' }]},
		{ code: 'class A { get a(){} get b(){} set a(v){} }', options: [{ order: [ 'everything-else' ], accessorPairPositioning: 'any' }]},
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
			options: defaultOptions,
		},
		{
			code: 'class A { constructor(){} _other(){} afterCtor(){} }',
			errors: [
				{
					message: 'Expected method afterCtor to come before method _other.',
					type: 'MethodDefinition',
				},
			],
			options: defaultOptions,
		},
		{
			code: 'class A { _afterCtor(){} constructor(){} }',
			errors: [
				{
					message: 'Expected constructor to come before method _afterCtor.',
					type: 'MethodDefinition',
				},
			],
			options: defaultOptions,
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
			options: defaultOptions,
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
			options: defaultOptions,
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
			code: 'class A { constructor(){} onClick(){} }',
			errors: [
				{
					message: 'Expected method onClick to come before constructor.',
					type: 'MethodDefinition',
				},
			],
			options: customGroupOptions,
		},
		// nested groups
		{
			code: 'class A { a(){} c(){} b(){} d(){} }',
			errors: [
				{
					message: 'Expected method b to come before method c.',
					type: 'MethodDefinition',
				},
			],
			options: nestedGroupOptions,
		},
		{
			code: 'class A { b(){} c(){} a(){} }',
			errors: [
				{
					message: 'Expected method a to come before method b. (1 similar problem in this class)',
					type: 'MethodDefinition',
				},
			],
			options: stopAfterFirstOptions,
		},
		// accessors
		{
			code: 'class A { b(){} get a(){} }',
			errors: [
				{
					message: 'Expected getter a to come before method b.',
					type: 'MethodDefinition',
				},
			],
			options: accessorOptions,
		},
		{
			code: 'class A { b(){} set a(v){} }',
			errors: [
				{
					message: 'Expected setter a to come before method b.',
					type: 'MethodDefinition',
				},
			],
			options: accessorOptions,
		},
		{
			code: 'class A { b(){} get a(){} set a(v){} }',
			errors: [
				{
					message: 'Expected accessor pair a to come before method b.',
					type: 'MethodDefinition',
				},
			],
			options: accessorOptions,
		},
		{
			code: 'class A { b(){} get a(){} c(){} set a(v){} }',
			errors: [
				{
					message: 'Expected accessor pair a to come before method b.',
					type: 'MethodDefinition',
				},
				{
					message: 'Expected setter a to come immediately after getter a.',
					type: 'MethodDefinition',
				},
			],
			options: accessorOptions,
		},
		{
			code: 'class A { set a(v){} get a(){}  }',
			errors: [
				{
					message: 'Expected getter a to come immediately before setter a.',
					type: 'MethodDefinition',
				},
			],
			options: accessorOptions,
		},
		{
			code: 'class A { get a(){} set a(v){} }',
			errors: [
				{
					message: 'Expected setter a to come immediately before getter a.',
					type: 'MethodDefinition',
				},
			],
			options: [{ order: [ 'everything-else' ], accessorPairPositioning: 'setThenGet' }],
		},
	],
});

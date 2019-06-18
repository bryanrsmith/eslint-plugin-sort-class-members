import eslint from 'eslint';
import plugin from '../../src';

const rule = plugin.rules['sort-class-members'];
const defaultOptions = [
	plugin.configs.recommended.rules['sort-class-members/sort-class-members'][1],
];

const ruleTester = new eslint.RuleTester({ env: { es6: true } });

const regexpOptions = [
	{
		order: ['before', '/ab.+/', 'after', '[everything-else]'],
	},
];

const customGroupOptions = [
	{
		order: ['[event-handlers]', 'constructor', '[everything-else]'],
		groups: {
			'event-handlers': [{ type: 'method', name: '/on.+/' }],
		},
	},
];

const accessorPairCustomGroupOptions = [
	{
		order: ['[conventional-private-getters]', '[methods]', '[conventional-private-methods]'],
		groups: {
			'conventional-private-getters': [
				{
					type: 'method',
					kind: 'get',
					accessorPair: false,
					name: '/_.+/',
				},
			],
		},
	},
];

const alphabeticalOptions = [
	{
		order: ['[constructor]', '[methods]'],
		groups: {
			methods: [
				{
					sort: 'alphabetical',
					type: 'method',
				},
			],
		},
	},
];

const objectOrderOptions = [
	{
		order: [
			{ type: 'method' },
			{ type: 'property', name: '/_.+' },
			{ type: 'method', static: true },
		],
	},
];

const nestedGroupOptions = [
	{
		order: ['a', '[outer]', 'd'],
		groups: {
			outer: ['b', '[inner]'],
			inner: ['c'],
		},
	},
];

const stopAfterFirstOptions = [
	{
		order: ['a', 'b', 'c'],
		stopAfterFirstProblem: true,
	},
];

const accessorOptions = [
	{
		order: [{ kind: 'get' }, { kind: 'set' }, { accessorPair: true }, '[everything-else]'],
	},
];

const propertyTypeOptions = [
	{
		order: [
			{ type: 'property', propertyType: 'Literal' },
			{ type: 'property', propertyType: 'ArrowFunctionExpression' },
			'[everything-else]',
		],
	},
];

ruleTester.run('sort-class-members', rule, {
	valid: [
		{ code: 'class A {}', options: defaultOptions },
		{ code: 'class A { static beforeCtor(){} constructor(){} }', options: defaultOptions },
		{
			code: 'class A { static beforeCtor(){} constructor(){} afterCtor(){} }',
			options: defaultOptions,
		},
		{ code: 'class A { constructor(){} afterCtor(){} }', options: defaultOptions },
		{ code: 'class A { constructor(){} afterCtor(){} other(){} }', options: defaultOptions },
		{
			code: 'class A { static a = 1; static b(){} c = 2; _d = 3; constructor(){} e(){} }',
			parser: 'babel-eslint',
			options: defaultOptions,
		},

		// class properties should work with babel-eslint
		{
			code: 'class A { static bar = 1; constructor(){} }',
			parser: 'babel-eslint',
			options: defaultOptions,
		},
		{
			code: 'class A { bar = 1; constructor(){} }',
			parser: 'babel-eslint',
			options: defaultOptions,
		},
		{ code: 'class A { foo }', parser: 'babel-eslint', options: defaultOptions },
		{
			code: 'class A { foo = 1; bar = () => 2 }',
			parser: 'babel-eslint',
			options: propertyTypeOptions,
		},

		// regexp names
		{ code: 'class A { before(){} abc(){} after(){} }', options: regexpOptions },
		{ code: 'class A { before(){} abc(){} after(){} xyz(){} }', options: regexpOptions },

		// custom groups
		{ code: 'class A { onClick(){} constructor(){} }', options: customGroupOptions },
		{ code: 'class A { onClick(){} abc(){} }', options: customGroupOptions },
		{
			code: 'class A { onClick(){} onChange(){} constructor(){} prop; }',
			parser: 'babel-eslint',
			options: customGroupOptions,
		},
		{
			code: 'class A { get _a() { return 1; } m() { return 2; } _p() { return 3; } }',
			options: accessorPairCustomGroupOptions,
		},

		// object config options
		{
			code: 'class A { a(){} _p = 1; static b(){} }',
			parser: 'babel-eslint',
			options: objectOrderOptions,
		},

		// nested groups
		{ code: 'class A { a(){} b(){} c(){} d(){} }', options: nestedGroupOptions },

		// undefined groups
		{ code: 'class A { a(){} b(){} }', options: [{ order: ['a', '[blah]', 'b'] }] },

		// accessors
		{ code: 'class A { get a(){} }', options: accessorOptions },
		{ code: 'class A { get a(){} set a(v){} }', options: accessorOptions },
		{ code: 'class A { set a(v){} }', options: accessorOptions },
		{ code: 'class A { get a(){} b(){} }', options: accessorOptions },
		{
			code: 'class A { get a(){} set a(v){} }',
			options: [{ order: ['everything-else'], accessorPairPositioning: 'getThenSet' }],
		},
		{
			code: 'class A { get a(){} set b(v){} get b(){} }',
			options: [{ order: ['everything-else'], accessorPairPositioning: 'together' }],
		},
		{
			code: 'class A { get a(){} set b(v){} get b(){} }',
			options: [{ order: ['everything-else'], accessorPairPositioning: 'setThenGet' }],
		},
		{
			code: 'class A { get a(){} get b(){} set a(v){} }',
			options: [{ order: ['everything-else'], accessorPairPositioning: 'any' }],
		},
		{
			code: 'class A { constructor(){} a(){} b(){} c(){} }',
			options: alphabeticalOptions,
		},

		// Class expressions
		{ code: 'module.exports = class A {}', options: defaultOptions },
	],
	invalid: [
		{
			code: 'class A { constructor(){} static beforeCtor(){} }',
			output: 'class A { static beforeCtor(){} constructor(){}  }',
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
			output: 'class A { constructor(){} afterCtor(){} _other(){}  }',
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
			output: 'class A { constructor(){} _afterCtor(){}  }',
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
			output: 'class A { bar; constructor(){}  }',
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
			output: 'class A { static bar; constructor(){}  }',
			errors: [
				{
					message: 'Expected static property bar to come before constructor.',
					type: 'ClassProperty',
				},
			],
			parser: 'babel-eslint',
			options: defaultOptions,
		},
		{
			code: 'class A { bar = () => 2; foo = 1; baz() {} }',
			output: 'class A { foo = 1; bar = () => 2;  baz() {} }',
			errors: [
				{
					message: 'Expected property foo to come before property bar.',
					type: 'ClassProperty',
				},
			],
			parser: 'babel-eslint',
			options: propertyTypeOptions,
		},
		// regexp groups
		{
			code: 'class A { abc(){} before(){} after(){} }',
			output: 'class A { before(){} abc(){}  after(){} }',
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
			code: 'class A { xyz(){} before(){} after(){}; }', // no output fixes cause conflicts
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
			output: 'class A { onClick(){} constructor(){}  }',
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
			output: 'class A { a(){} b(){} c(){}  d(){} }',
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
			output: 'class A { a(){} b(){} c(){}  }',
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
			output: 'class A { get a(){} b(){}  }',
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
			output: 'class A { set a(v){} b(){}  }',
			errors: [
				{
					message: 'Expected setter a to come before method b.',
					type: 'MethodDefinition',
				},
			],
			options: accessorOptions,
		},
		{
			code: 'class A { b(){} get a(){} set a(v){} }', // no output fixes cause conflicts
			errors: [
				{
					message: 'Expected accessor pair a to come before method b.',
					type: 'MethodDefinition',
				},
			],
			options: accessorOptions,
		},
		{
			code: 'class A { b(){} get a(){} c(){} set a(v){} }', // no output fixes cause conflicts
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
			output: 'class A { get a(){} set a(v){}   }',
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
			output: 'class A { set a(v){} get a(){}  }',
			errors: [
				{
					message: 'Expected setter a to come immediately before getter a.',
					type: 'MethodDefinition',
				},
			],
			options: [{ order: ['everything-else'], accessorPairPositioning: 'setThenGet' }],
		},
		{
			code: 'class A { constructor(){} b(){} a(){} c(){} }',
			output: 'class A { constructor(){} a(){} b(){}  c(){} }',
			errors: [
				{
					message: 'Expected method a to come before method b.',
					type: 'MethodDefinition',
				},
			],
			options: alphabeticalOptions,
		},

		// Class expressions
		{
			code: 'module.exports = class A { constructor(){} static beforeCtor(){} }',
			output: 'module.exports = class A { static beforeCtor(){} constructor(){}  }',
			errors: [
				{
					message: 'Expected static method beforeCtor to come before constructor.',
					type: 'MethodDefinition',
				},
			],
			options: defaultOptions,
		},

		// fix tests
		{
			code: `class A {\n/**\n* jsdoc thing\n*/\nconstructor(){} \nstatic beforeCtor(){} \n}`,
			output: `class A {\nstatic beforeCtor(){}\n/**\n* jsdoc thing\n*/\nconstructor(){} \n \n}`,
			errors: [
				{
					message: 'Expected static method beforeCtor to come before constructor.',
					type: 'MethodDefinition',
				},
			],
			options: defaultOptions,
		},
		{
			code: `class A {\nconstructor(){}\n/**\n* jsdoc documentation\n*/\nstatic beforeCtor(){}\n}`,
			output: `class A {\n/**\n* jsdoc documentation\n*/\nstatic beforeCtor(){}\nconstructor(){}\n\n\n}`,
			errors: [
				{
					message: 'Expected static method beforeCtor to come before constructor.',
					type: 'MethodDefinition',
				},
			],
			options: defaultOptions,
		},
		{
			code: `class A { constructor(){}\n// documentation\nstatic beforeCtor(){}\n}`,
			output: `class A { // documentation\nstatic beforeCtor(){}\nconstructor(){}\n\n\n}`,
			errors: [
				{
					message: 'Expected static method beforeCtor to come before constructor.',
					type: 'MethodDefinition',
				},
			],
			options: defaultOptions,
		},
		{
			code: `class A { constructor(){}\n// documentation\nstatic beforeCtor(){}\n}`,
			output: 'class A { // documentation\nstatic beforeCtor(){}\nconstructor(){}\n\n\n}',
			errors: [
				{
					message: 'Expected static method beforeCtor to come before constructor.',
					type: 'MethodDefinition',
				},
			],
			options: defaultOptions,
		},
	],
});

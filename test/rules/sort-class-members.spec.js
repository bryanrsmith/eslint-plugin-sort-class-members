import eslint from 'eslint';
import plugin from '../../src';

const rule = plugin.rules['sort-class-members'];
const defaultOptions = [
	plugin.configs.recommended.rules['sort-class-members/sort-class-members'][1],
];

const customParsers = [
	require.resolve('@typescript-eslint/parser'),
	require.resolve('@babel/eslint-parser'),
	require.resolve('babel-eslint-parser-legacy'),
];

const parserOptions = {
	babelOptions: {
		plugins: [
			['@babel/plugin-proposal-decorators', { legacy: true }],
			['@babel/plugin-proposal-class-properties'],
		],
	},
	ecmaFeatures: {
		legacyDecorators: true,
		experimentalDecorators: true,
	},
};

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

const alphabeticalLocaleENOptions = [
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
		locale: 'en-US',
	},
];

const objectOrderOptions = [
	{
		order: [
			{ type: 'method' },
			{ type: 'property', name: '/_.+' },
			{ type: 'method', static: true },
			{ type: 'method', async: true },
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

const accessorEitherOptions = [
	{
		order: [{ type: 'method', kind: 'accessor' }, '[everything-else]'],
	},
];

const accessorNeitherOptions = [
	{
		order: [{ type: 'method', kind: 'nonAccessor' }, '[everything-else]'],
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

const decoratorOptions = [
	{
		order: ['[observables]', '[properties]', '[actions]', '[injects]'],
		groups: {
			observables: [{ type: 'property', groupByDecorator: 'observable' }],
			actions: [{ type: 'method', groupByDecorator: 'action' }],
			injects: [{ type: 'property', groupByDecorator: 'Inject' }],
		},
	},
];

const decoratorBooleanOptions = [
	{
		order: ['[no-decorators]', 'constructor'],
		groups: {
			'no-decorators': [{ groupByDecorator: false }],
			'any-decorator': [{ groupByDecorator: true }],
		},
	},
];

const decoratorRegexpOptions = [
	{
		order: ['before', '[decorator-starts-with-ab]', 'after', '[everything-else]'],
		groups: {
			'decorator-starts-with-ab': [{ groupByDecorator: '/ab.+/' }],
		},
	},
];

const decoratorOptionsAlphabetical = [
	{
		order: ['[observables]', '[properties]'],
		groups: {
			observables: [{ type: 'property', groupByDecorator: 'observable', sort: 'alphabetical' }],
		},
	},
];

const computedMethodKeysCustomGroupOptions = [
	{
		order: ['constructor', '[computed-key-methods]'],
		groups: {
			'computed-key-methods': [
				{
					type: 'method',
					name: '/^\\[[^\\]]+\\]$/',
					sort: 'alphabetical',
				},
			],
		},
	},
];

const privateAlphabeticalProperties = [
	{
		groups: {
			'private-properties': [
				{
					sort: 'alphabetical',
					static: false,
					type: 'property',
					private: true,
				},
			],
		},
		order: ['[private-properties]'],
	},
];

const privateStaticAlphabeticalProperties = [
	{
		groups: {
			'private-static-properties': [
				{
					sort: 'alphabetical',
					static: true,
					type: 'property',
					private: true,
				},
			],
		},
		order: ['[private-static-properties]'],
	},
];

const privateStaticAlphabeticalMethods = [
	{
		groups: {
			'private-static-methods': [
				{
					sort: 'alphabetical',
					static: true,
					type: 'method',
					private: true,
				},
			],
		},
		order: ['[private-static-methods]'],
	},
];

const privateAlphabeticalMethods = [
	{
		groups: {
			'private-methods': [
				{
					sort: 'alphabetical',
					static: false,
					type: 'method',
					private: true,
				},
			],
		},
		order: ['[private-methods]'],
	},
];

const privateRegexpOptions = [
	{
		order: ['before', '/#ab.+/', 'after', '[everything-else]'],
	},
];

const typescriptAccessibilityOptions = [
	{
		groups: {
			private: [
				{
					accessibility: 'private',
				},
			],
			public: [
				{
					accessibility: 'public',
				},
			],
		},
		order: ['[private]', 'constructor', '[public]'],
	},
];

const typescriptKeywordsOptions = [
	{
		groups: {
			abstract: [
				{
					abstract: true,
				},
			],
			override: [
				{
					override: true,
				},
			],
			readonly: [
				{
					readonly: true,
				},
			],
		},
		order: ['[override]', '[readonly]', '[abstract]'],
	},
];

const typescriptInterfaceOptions = [
	{
		order: ['[properties]', '[accessors]', '[non-accessors]'],
		groups: {
			accessors: [
				{
					type: 'method',
					kind: 'accessor',
				},
			],
			'non-accessors': [
				{
					type: 'method',
					kind: 'nonAccessor',
				},
			],
		},
		sortInterfaces: true,
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

		...withCustomParsers([
			{
				code: 'class A { static a = 1; static b(){} c = 2; _d = 3; constructor(){} e(){} }',
				options: defaultOptions,
			},

			// class properties should work with @babel/eslint-parser
			{
				code: 'class A { static bar = 1; constructor(){} }',
				options: defaultOptions,
			},
			{
				code: 'class A { bar = 1; constructor(){} }',
				options: defaultOptions,
			},
			{
				code: 'class A { foo }',
				options: defaultOptions,
			},
			{
				code: 'class A { foo = 1; bar = () => 2 }',
				options: propertyTypeOptions,
			},

			// class properties with decorators
			{
				code: 'class A { @observable bar = 2; @observable baz = 1; foo = 3; @action lorem(){} @Inject() hoge = 4; @observable @Inject() fuga = 5; constructor(){} }',
				options: decoratorOptions,
			},

			{
				code: 'class A { @observable bar = 2; @observable foo = 1; @Inject() @observable fuga = 5; baz = 3; constructor(){}; @Inject() hoge = 4; }',
				options: decoratorOptions,
			},

			// class properties without or without decorators regardless of the name
			{
				code: 'class A { bar = 2; foo = 3; static x = 55; constructor(){}; @dec something(){};}',
				options: decoratorBooleanOptions,
			},
			// regexp decorators
			{ code: 'class A { before(){} @abc() x = 4; after(){} }', options: decoratorRegexpOptions },
			{
				code: 'class A { before(){} @something @abc() x = 4; after(){} xyz(){} }',
				options: decoratorRegexpOptions,
			},
		]),

		// regexp names
		{ code: 'class A { before(){} abc(){} after(){} }', options: regexpOptions },
		{ code: 'class A { before(){} abc(){} after(){} xyz(){} }', options: regexpOptions },

		// custom groups
		{ code: 'class A { onClick(){} constructor(){} }', options: customGroupOptions },
		{ code: 'class A { onClick(){} abc(){} }', options: customGroupOptions },
		...withCustomParsers({
			code: 'class A { onClick(){} onChange(){} constructor(){} prop; }',
			options: customGroupOptions,
		}),
		{
			code: 'class A { get _a() { return 1; } m() { return 2; } _p() { return 3; } }',
			options: accessorPairCustomGroupOptions,
		},

		// object config options
		...withCustomParsers({
			code: 'class A { a(){} _p = 1; static b(){} async c(){} }',
			options: objectOrderOptions,
		}),

		// nested groups
		{ code: 'class A { a(){} b(){} c(){} d(){} }', options: nestedGroupOptions },

		// undefined groups
		{ code: 'class A { a(){} b(){} }', options: [{ order: ['a', '[blah]', 'b'] }] },

		// accessors
		{ code: 'class A { get a(){} }', options: accessorOptions },
		{ code: 'class A { get a(){} set a(v){} }', options: accessorOptions },
		{ code: 'class A { set a(v){} }', options: accessorOptions },
		{ code: 'class A { get a(){} b(){} }', options: accessorOptions },

		{ code: 'class A { get a(){} }', options: accessorEitherOptions },
		{ code: 'class A { get a(){} set a(v){} }', options: accessorEitherOptions },
		{ code: 'class A { set a(v){} }', options: accessorEitherOptions },
		{ code: 'class A { get a(){} b(){} }', options: accessorEitherOptions },

		{ code: 'class A { get a(){} }', options: accessorNeitherOptions },
		{ code: 'class A { get a(){} set a(v){} }', options: accessorNeitherOptions },
		{ code: 'class A { set a(v){} }', options: accessorNeitherOptions },
		{ code: 'class A { b(){} get a(){} }', options: accessorNeitherOptions },
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
		{
			code: 'class A { constructor(){} c(){} ch(){} h(){} }',
			options: alphabeticalLocaleENOptions,
		},

		// Class expressions
		{ code: 'module.exports = class A {}', options: defaultOptions },
		{ code: 'class { [k: string]: any; }', parser: require.resolve('@typescript-eslint/parser') },

		// TS accessibility
		{
			code: 'class { private a: any; constructor(){} b(){} }',
			options: typescriptAccessibilityOptions,
			parser: require.resolve('@typescript-eslint/parser'),
		},
		{
			code: 'class { private a: any; constructor(){} public b(){} c(){} }',
			options: typescriptAccessibilityOptions,
			parser: require.resolve('@typescript-eslint/parser'),
		},
		{
			code: 'class { override a: any; readonly b = true; abstract c: () => {} }',
			options: typescriptKeywordsOptions,
			parser: require.resolve('@typescript-eslint/parser'),
		},
		{
			code: 'abstract class Foo<T> { protected abstract readonly _foo: T; public readonly bar: string; protected constructor(bar: string) {}}',
			options: [{ order: ['[properties]', 'constructor', '[methods]'] }],
			parser: require.resolve('@typescript-eslint/parser'),
		},
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
		...withCustomParsers([
			{
				code: 'class A { constructor(){} bar; }',
				output: 'class A { bar; constructor(){}  }',
				errors: [
					{
						message: 'Expected property bar to come before constructor.',
					},
				],
				options: defaultOptions,
			},
			{
				code: 'class A { constructor(){} static bar; }',
				output: 'class A { static bar; constructor(){}  }',
				errors: [
					{
						message: 'Expected static property bar to come before constructor.',
					},
				],
				options: defaultOptions,
			},
			{
				code: 'class A { bar = () => 2; foo = 1; baz() {} }',
				output: 'class A { foo = 1; bar = () => 2;  baz() {} }',
				errors: [
					{
						message: 'Expected property foo to come before property bar.',
					},
				],
				options: propertyTypeOptions,
			},
		]),
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
			code: 'class A { xyz(){} before(){} after(){}; }',
			output: 'class A { before(){} xyz(){}  after(){}; }',
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
			code: 'class A { b(){} get a(){} set a(v){} }',
			// TODO: output asserts current behavior, which does not fully resolve the violation
			output: 'class A { get a(){} b(){}  set a(v){} }',
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
			// TODO: output asserts current behavior, which does not fully resolve the violation
			output: 'class A { get a(){} b(){}  c(){} set a(v){} }',
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
		{
			code: 'class A { constructor(){} h(){} ch(){} i(){} }',
			output: 'class A { constructor(){} ch(){} h(){}  i(){} }',
			errors: [
				{
					message: 'Expected method ch to come before method h.',
					type: 'MethodDefinition',
				},
			],
			options: alphabeticalLocaleENOptions,
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
		// decorators
		...withCustomParsers([
			{
				code: 'module.exports = class A { constructor(){} @moveThis static beforeCtor(){} }',
				output: 'module.exports = class A { @moveThis static beforeCtor(){} constructor(){}  }',
				errors: [
					{
						message: 'Expected static method beforeCtor to come before constructor.',
						type: 'MethodDefinition',
					},
				],
				options: defaultOptions,
			},
			{
				code: 'module.exports = class A { constructor(){} @moveThis static beforeCtor(){} }',
				output: 'module.exports = class A { @moveThis static beforeCtor(){} constructor(){}  }',
				errors: [
					{
						message: 'Expected static method beforeCtor to come before constructor.',
						type: 'MethodDefinition',
					},
				],
				options: defaultOptions,
			},
			{
				code: 'module.exports = class A { constructor(){} @moveThis @andThis static beforeCtor(){} }',
				output:
					'module.exports = class A { @moveThis @andThis static beforeCtor(){} constructor(){}  }',
				errors: [
					{
						message: 'Expected static method beforeCtor to come before constructor.',
						type: 'MethodDefinition',
					},
				],
				options: defaultOptions,
			},
			{
				code: 'module.exports = class A { constructor(){} /** move the comment */ @moveThis @andThis static beforeCtor(){} }',
				output:
					'module.exports = class A { /** move the comment */ @moveThis @andThis static beforeCtor(){} constructor(){}   }',
				errors: [
					{
						message: 'Expected static method beforeCtor to come before constructor.',
						type: 'MethodDefinition',
					},
				],
				options: defaultOptions,
			},
			{
				code: 'module.exports = class A { constructor(){} /** move the comment */ @moveThis /** this thing needs to go too */ @andThis /** yet another comment */ static beforeCtor(){} }',
				output:
					'module.exports = class A { /** move the comment */ @moveThis /** this thing needs to go too */ @andThis /** yet another comment */ static beforeCtor(){} constructor(){}   }',
				errors: [
					{
						message: 'Expected static method beforeCtor to come before constructor.',
						type: 'MethodDefinition',
					},
				],
				options: defaultOptions,
			},
			// https://github.com/bryanrsmith/eslint-plugin-sort-class-members/issues/52
			{
				code: `module.exports = class A { @moveThis afterCtor() {} constructor() {} }`,
				output: `module.exports = class A { constructor() {} @moveThis afterCtor() {}  }`,
				errors: [
					{
						message: 'Expected constructor to come before method afterCtor.',
						type: 'MethodDefinition',
					},
				],
				options: defaultOptions,
			},
			{
				code: 'class A {  @observable bar = 2; baz = 3; @Inject() hoge = 4; @observable foo = 1; @observable @Inject() fuga = 5; @action lorem(){} constructor(){} }',
				output:
					'class A {  @observable bar = 2; @observable foo = 1; baz = 3; @Inject() hoge = 4;  @observable @Inject() fuga = 5; @action lorem(){} constructor(){} }',
				errors: [
					{
						message: 'Expected property foo to come before property baz.',
					},
					{
						message: 'Expected property foo to come before property hoge.',
					},
					{
						message: 'Expected method lorem to come before property hoge.',
						type: 'MethodDefinition',
					},
				],
				options: decoratorOptions,
			},
			{
				code: 'class A { @observable foo = 1; @observable bar = 2; constructor(){} }',
				output: 'class A { @observable bar = 2; @observable foo = 1;  constructor(){} }',
				errors: [
					{
						message: 'Expected property bar to come before property foo.',
					},
				],
				options: decoratorOptionsAlphabetical,
			},
			// object config options
			{
				code: 'class A { a(){} _p = 1; async b(){} static c(){} }',
				output: 'class A { a(){} _p = 1; static c(){} async b(){}  }',
				errors: [
					{
						message: 'Expected static method c to come before method b.',
						type: 'MethodDefinition',
					},
				],
				options: objectOrderOptions,
			},
		]),
		// computed method keys
		{
			code: 'module.exports.foo = Symbol("bar"); class A { [ module.exports.foo ]() {} constructor() {} }',
			output:
				'module.exports.foo = Symbol("bar"); class A { constructor() {} [ module.exports.foo ]() {}  }',
			errors: [
				{
					message: 'Expected constructor to come before method [ module.exports.foo ].',
					type: 'MethodDefinition',
				},
			],
			options: computedMethodKeysCustomGroupOptions,
		},
		{
			code: 'var foo = "bar"; class A { [`${foo} baz`]() {} constructor() {} }',
			output: 'var foo = "bar"; class A { constructor() {} [`${foo} baz`]() {}  }',
			errors: [
				{
					message: 'Expected constructor to come before method [`${foo} baz`].',
					type: 'MethodDefinition',
				},
			],
			options: computedMethodKeysCustomGroupOptions,
		},
		{
			code: 'var foo = () => "bar"; class A { [foo()]() {} constructor() {} }',
			output: 'var foo = () => "bar"; class A { constructor() {} [foo()]() {}  }',
			errors: [
				{
					message: 'Expected constructor to come before method [foo()].',
					type: 'MethodDefinition',
				},
			],
			options: computedMethodKeysCustomGroupOptions,
		},
		// private members
		...withCustomParsers([
			{
				code: 'class A { static #foo = 1; static #bar = 2; }',
				output: 'class A { static #bar = 2; static #foo = 1;  }',
				errors: [
					{
						message: 'Expected static property #bar to come before static property #foo.',
					},
				],
				options: privateStaticAlphabeticalProperties,
			},
			{
				code: 'class A { #foo = 1; #bar = 2; }',
				output: 'class A { #bar = 2; #foo = 1;  }',
				errors: [
					{
						message: 'Expected property #bar to come before property #foo.',
					},
				],
				options: privateAlphabeticalProperties,
			},
			{
				code: 'class A { static #foo() {} static #bar() {} }',
				output: 'class A { static #bar() {} static #foo() {}  }',
				errors: [
					{
						message: 'Expected static method #bar to come before static method #foo.',
						type: 'MethodDefinition',
					},
				],
				options: privateStaticAlphabeticalMethods,
			},
			{
				code: 'class A { #foo() {} #bar() {} }',
				output: 'class A { #bar() {} #foo() {}  }',
				errors: [
					{
						message: 'Expected method #bar to come before method #foo.',
						type: 'MethodDefinition',
					},
				],
				options: privateAlphabeticalMethods,
			},
			{
				code: 'class A { #abc(){} before(){} after(){} }',
				output: 'class A { before(){} #abc(){}  after(){} }',
				errors: [
					{
						message: 'Expected method before to come before method #abc.',
						type: 'MethodDefinition',
					},
				],
				options: privateRegexpOptions,
			},
		]),
		{
			code: 'class { constructor(){} private b: any; }',
			output: 'class { private b: any; constructor(){}  }',
			errors: [
				{
					message: 'Expected property b to come before constructor.',
					type: 'PropertyDefinition',
				},
			],
			options: typescriptAccessibilityOptions,
			parser: require.resolve('@typescript-eslint/parser'),
		},
		{
			code: 'class { a(){} private b: any; }',
			output: 'class { private b: any; a(){}  }',
			errors: [
				{
					message: 'Expected property b to come before method a.',
					type: 'PropertyDefinition',
				},
			],
			options: typescriptAccessibilityOptions,
			parser: require.resolve('@typescript-eslint/parser'),
		},
		{
			code: 'class { abstract a; override b; }',
			output: 'class { override b; abstract a;  }',
			errors: [
				{
					message: 'Expected property b to come before property a.',
					type: 'PropertyDefinition',
				},
			],
			options: typescriptKeywordsOptions,
			parser: require.resolve('@typescript-eslint/parser'),
		},
		{
			code: 'class { readonly a; override b; }',
			output: 'class { override b; readonly a;  }',
			errors: [
				{
					message: 'Expected property b to come before property a.',
					type: 'PropertyDefinition',
				},
			],
			options: typescriptKeywordsOptions,
			parser: require.resolve('@typescript-eslint/parser'),
		},
		{
			code: 'class { abstract a(); readonly b; }',
			output: 'class { readonly b; abstract a();  }',
			errors: [
				{
					message: 'Expected property b to come before method a.',
					type: 'PropertyDefinition',
				},
			],
			options: typescriptKeywordsOptions,
			parser: require.resolve('@typescript-eslint/parser'),
		},
		// Interface sorting
		{
			code: 'interface A { get a(); b; }',
			output: 'interface A { b; get a();  }',
			errors: [
				{
					message: 'Expected property b to come before getter a.',
					type: 'TSPropertySignature',
				},
			],
			options: typescriptInterfaceOptions,
			parser: require.resolve('@typescript-eslint/parser'),
		},
		{
			code: 'interface A { a(); b; }',
			output: 'interface A { b; a();  }',
			errors: [
				{
					message: 'Expected property b to come before method a.',
					type: 'TSPropertySignature',
				},
			],
			options: typescriptInterfaceOptions,
			parser: require.resolve('@typescript-eslint/parser'),
		},
		{
			code: 'interface A { a(); get b(); }',
			output: 'interface A { get b(); a();  }',
			errors: [
				{
					message: 'Expected getter b to come before method a.',
					type: 'TSMethodSignature',
				},
			],
			options: typescriptInterfaceOptions,
			parser: require.resolve('@typescript-eslint/parser'),
		},
	],
});

function withCustomParsers(ruleOrRules) {
	return [ruleOrRules]
		.flat()
		.flatMap((rule) => customParsers.map((parser) => ({ ...rule, parser, parserOptions })));
}

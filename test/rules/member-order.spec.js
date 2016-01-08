import eslint from 'eslint';
import rule from '../../src/rules/member-order';

let ruleTester = new eslint.RuleTester({ parser: 'babel-eslint' });

ruleTester.run('member-order', rule, {
	valid: [
		{ code: 'class Foo {}' },
		{ code: 'class Foo { static beforeCtor(){} constructor(){} }' },
		{ code: 'class Foo { static beforeCtor(){} constructor(){} afterCtor(){} }' },
		{ code: 'class Foo { static bar = 1; constructor(){} }' },
		{ code: 'class Foo { bar = 1; constructor(){} }' },
		{ code: 'class Foo { constructor(){} afterCtor(){} }' },
		{ code: 'class Foo { constructor(){} afterCtor(){} other(){} }' },
	],
	invalid: [
		{
			code: 'class Foo { constructor(){} static beforeCtor(){} }',
			errors: [
				{
					message: 'Expected static method beforeCtor to come before constructor.',
					type: 'MethodDefinition',
				},
			],
		},
		{
			code: 'class Foo { constructor(){} _other(){} afterCtor(){} }',
			errors: [
				{
					message: 'Expected method afterCtor to come before method _other.',
					type: 'MethodDefinition',
				},
			],
		},
		{
			code: 'class Foo { _afterCtor(){} constructor(){} }',
			errors: [
				{
					message: 'Expected constructor to come before method _afterCtor.',
					type: 'MethodDefinition',
				},
			],
		},
		{
			code: 'class Foo { constructor(){} bar; }',
			errors: [
				{
					message: 'Expected property bar to come before constructor.',
					type: 'ClassProperty',
				},
			],
		},
	],
});

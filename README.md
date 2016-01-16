[![build status][travis-image]][travis-url]
[![test coverage][coveralls-image]][coveralls-url]

# eslint-plugin-sort-class-members

ESLint rule for enforcing consistent ES6 class member order.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-sort-class-members`:

```
$ npm i eslint-plugin-sort-class-members --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-sort-class-members` globally.

## Usage

Add `sort-class-members` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
	"plugins": [
		"sort-class-members"
	]
}
```

Then configure the rules you want to use under the rules section.

```json
{
	"rules": {
		"sort-class-members": [2, {
			"order": [
				"[static-properties]",
				"[static-methods]",
				"[properties]",
				"[conventional-private-properties]",
				"constructor",
				"[methods]",
				"[conventional-private-methods]"
			]
		}]
	}
}
```

[travis-image]: https://img.shields.io/travis/bryanrsmith/eslint-plugin-sort-class-members/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/bryanrsmith/eslint-plugin-sort-class-members
[coveralls-image]: https://img.shields.io/coveralls/bryanrsmith/eslint-plugin-sort-class-members/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/bryanrsmith/eslint-plugin-sort-class-members?branch=master

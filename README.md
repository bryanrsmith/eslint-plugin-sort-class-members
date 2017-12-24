[![build status][travis-image]][travis-url]
[![test coverage][coveralls-image]][coveralls-url]
[![npm][npm-image]][npm-url]

# eslint-plugin-sort-class-members

ESLint rule for enforcing consistent ES6 class member order.

## Installation

Install [ESLint](http://eslint.org) and `eslint-plugin-sort-class-members`:

```
$ npm install eslint eslint-plugin-sort-class-members --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-sort-class-members` globally.

## Usage

Add `sort-class-members` to the plugins section of your `.eslintrc` configuration file, and configure the rule under the rules section.

```json
{
  "plugins": [
    "sort-class-members"
  ],
  "rules": {
    "sort-class-members/sort-class-members": [2, {
      "order": [
        "[static-properties]",
        "[static-methods]",
        "[properties]",
        "[conventional-private-properties]",
        "constructor",
        "[methods]",
        "[conventional-private-methods]"
      ],
      "accessorPairPositioning": "getThenSet",
    }]
  }
}
```

When using the default configuration (shown above), the following patterns are considered problems:

```js
class Foo {
  b = 'bar';

  c(){}

  constructor(){} // error Expected constructor to come before method c

  static a(){} // error Expected static method a to come before property b
}
```

When using the default configuration (shown above), the following patterns are not considered problems:
```js
class Foo {
  static a(){}

  b = 'bar';

  constructor(){}

  c(){}
}
```

## Configuration

The rule accepts the following configuration properties:
* `order`: Used to specify the expected sort order of class members.
* `groups`: May optionally be used to created customized named groups of members so that `order` can be more easily maintained. Groups can be referenced by name by using square brackets. E.g., `"[group-name]"`.
* `accessorPairPositioning`: Used to specify the required positioning of get/set pairs. Available values: `getThenSet`, `setThenGet`, `together`, `any`.
* `stopAfterFirstProblem`: Only report the first sort problem in each class (plus the number of problems found). Useful if you only want to know that the class has sort problems without spamming error messages. The default is `false`.

```js
{
  "order": [
    "constructor",
    "[event-handlers]", // reference the custom group defined in the "groups" property
    "[everything-else]" // a few groups are provided by default (see list below)
  ],
  "groups": {
    "event-handlers": [{ "name": "/on.+/", "type": "method" }]
  },
  "accessorPairPositioning": "getThenSet",
  "stopAfterFirstProblem": false
}
```

Members can be matched to positional slots using several criteria, including name (exact match or regexp), member type (method or property), and whether or not the member is static. Each match slot is described by an object with six properties, all of which are optional.
* `name`: a string matching the name of the member. If the string starts and ends with `/` it will be interpreted as a regular expression. E.g., `"/_.+/"` will match members whose name starts with an underscore.
* `type`: `"method"|"property"`. **Note**: Class properties currently require a custom parser like [babel-eslint](https://github.com/babel/babel-eslint).
* `kind`: `"get"|"set"`. A subtype of `type: "method"` that can match getter or setter methods.
* `propertyType`: A subtype of `type: "property"` that can match the type of the property value. e.g., `propertyType: "ArrowFunctionExpression"` to match properties whose value is initialized to an arrow function.
* `accessorPair`: `true|false`. True to match only getters and setters that are part of a pair. i.e., only those that have both `get` and `set` methods defined.
* `static`: `true|false` to restrict the match to static or instance members.
* `sort`: `"alphabetical"|"none"`. Used to require a specific sorting within the slot for matched members. Defaults to `"none"`.

A few examples:

* `{ "name": "create", "type": "method", "static": true }` would match a static method named `create`.
* `{ "static": true }` would match all static methods and properties.
* `{ "name": "/on.+/", "type": "method" }` would match both static and instance methods whose names start with "on".
* `"/on.+/"` is shorthand for `{ "name": "/on.+/" }`, and would match all static and instance methods and properties whose names start with "on".
* `{ "type": "method", "sort": "alphabetical" }` would match all methods, and enforce an alphabetical sort.

**Note**: You can simply use a string if you only want to match on the name.

The following groups are provided by default:
* `[properties]`: matches all properties
* `[getters]`: matches all getter methods
* `[setters]`: matches all setter methods
* `[accessor-pairs]`: matches getters and setters that are part of a pair (where both `get` and `set` methods are defined)
* `[static-properties]`: matches all static properties
* `[conventional-private-properties]`: matches properties whose name starts with an underscore
* `[arrow-function-properties]`: matches properties whose value is initialized to an arrow function
* `[methods]`: matches all methods
* `[static-methods]`: matches all static methods
* `[conventional-private-methods]`: matches methods whose name starts with an underscore
* `[everything-else]`: matches all class members not matched by any other rule

**NOTE**: Currently only class properties using the proposed syntax are matched by `"type": "property"`. Properties added via assignment are not considered by this rule.

## Automatically fixing sort order
Fixing of sort order related errors can be automated with the help of a codemod — [sort-class-members-codemod](https://github.com/pastelsky/sort-class-members-codemod)

## Acknowledgements
Inspired by the `sort-comp` rule from [eslint-plugin-react](https://github.com/yannickcr/eslint-plugin-react).

[travis-image]: https://img.shields.io/travis/bryanrsmith/eslint-plugin-sort-class-members/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/bryanrsmith/eslint-plugin-sort-class-members
[coveralls-image]: https://img.shields.io/coveralls/bryanrsmith/eslint-plugin-sort-class-members/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/bryanrsmith/eslint-plugin-sort-class-members?branch=master
[npm-image]: https://img.shields.io/npm/v/eslint-plugin-sort-class-members.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/eslint-plugin-sort-class-members

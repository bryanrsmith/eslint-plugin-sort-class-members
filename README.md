[![build status][travis-image]][travis-url]
[![test coverage][coveralls-image]][coveralls-url]

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
      ]
    }]
  }
}
```

## Configuration

The rule accepts two configuration properties:
* `order`: Used to specify the expected sort order of class members.
* `groups`: May optionally be used to created customized named groups of members so that `order` can be more easily maintained. Groups can be referenced by name by using square brackets. E.g., `"[group-name]"`.

```json
{
  "order": [
    "constructor",
    "[event-handlers]", // reference the custom group defined in the "groups" property
    "[everything-else]" // a few groups are provided by default (see list below)
  ],
  "groups": {
    "event-handlers": [{ "name": "/on.+/", "type": "method" }]
  }
}
```

Members can be matched by name (exact match or regexp), by type ("method" or "property"), and by whether or not the member is static. Each match may be described by an object with three properties, all of which are optional.
* `name`: a string matching the name of the member. If the string starts and ends with `/` it will be interpreted as a regular expression. E.g., `"/_.+/"`.
* `type`: `"method"|"property"`. Note that class properties currently require a custom parser like [babel-eslint](https://github.com/babel/babel-eslint).
* `static`: `true|false` to restrict the match to static or instance members.

A few examples:

* `{ "name": "create", "type": "method", "static": true }` would match a static method named `create`.
* `{ "static": true }` would match all static methods and properties.
* `{ "name": "/on.+/", "type": "method" }` would match both static and instance methods whose names start with "on".
* `"/on.+/"` is shorthand for `{ "name": "/on.+/" }`, and would match all static and instance methods and properties whose names start with "on".

Note that you can simply use a string if you only want to match on the name.

The following groups are provided by default:
* `[properties]`: matches all properties
* `[static-properties]`: matches all static properties
* `[conventional-private-properties]`: matches properties whose name starts with an underscore
* `[methods]`: matches all methods
* `[static-methods]`: matches all static methods
* `[conventional-private-methods]`: matches methods whose name starts with an underscore
* `[everything-else]`: matches all class members not matched by any other rule

**NOTE**: Currently only ES2016 property initializers are matched by `"type": "property"`. Properties added via assignment are not considered by this rule.

[travis-image]: https://img.shields.io/travis/bryanrsmith/eslint-plugin-sort-class-members/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/bryanrsmith/eslint-plugin-sort-class-members
[coveralls-image]: https://img.shields.io/coveralls/bryanrsmith/eslint-plugin-sort-class-members/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/bryanrsmith/eslint-plugin-sort-class-members?branch=master

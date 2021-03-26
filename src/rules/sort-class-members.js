import { sortClassMembersSchema } from './schema';

export const sortClassMembers = {
	getRule(defaults = {}) {
		function sortClassMembersRule(context) {
			const options = context.options[0] || {};
			const stopAfterFirst = !!options.stopAfterFirstProblem;
			const accessorPairPositioning = options.accessorPairPositioning || 'getThenSet';
			const order = options.order || defaults.order || [];
			const groups = { ...builtInGroups, ...defaults.groups, ...options.groups };
			const orderedSlots = getExpectedOrder(order, groups);
			const groupAccessors = accessorPairPositioning !== 'any';

			const rules = {
				ClassDeclaration(node) {
					let members = getClassMemberInfos(node, context.getSourceCode(), orderedSlots);

					// check for out-of-order and separated get/set pairs
					const accessorPairProblems = findAccessorPairProblems(members, accessorPairPositioning);
					for (const problem of accessorPairProblems) {
						const message =
							'Expected {{ source }} to come immediately {{ expected }} {{ target }}.';

						reportProblem({ problem, context, message, stopAfterFirst, problemCount });
						if (stopAfterFirst) {
							break;
						}
					}

					// filter out the second accessor in each pair so we only detect one problem
					// for out-of-order	accessor pairs
					members = members.filter(m => !(m.matchingAccessor && !m.isFirstAccessor));

					// ignore members that don't match any slots
					members = members.filter(member => member.acceptableSlots.length);

					// check member positions against rule order
					const problems = findProblems(members);
					const problemCount = problems.length;
					for (const problem of problems) {
						const message = 'Expected {{ source }} to come {{ expected }} {{ target }}.';
						reportProblem({
							problem,
							message,
							context,
							stopAfterFirst,
							problemCount,
							groupAccessors,
						});

						if (stopAfterFirst) {
							break;
						}
					}
				},
			};

			rules.ClassExpression = rules.ClassDeclaration;

			return rules;
		}

		sortClassMembersRule.schema = sortClassMembersSchema;
		sortClassMembersRule.fixable = 'code';
		return sortClassMembersRule;
	},
};

function reportProblem({
	problem,
	message,
	context,
	stopAfterFirst,
	problemCount,
	groupAccessors,
}) {
	const { source, target, expected } = problem;
	const reportData = {
		source: getMemberDescription(source, { groupAccessors }),
		target: getMemberDescription(target, { groupAccessors }),
		expected,
	};

	if (stopAfterFirst && problemCount > 1) {
		message += ' ({{ more }} similar {{ problem }} in this class)';
		reportData.more = problemCount - 1;
		reportData.problem = problemCount === 2 ? 'problem' : 'problems';
	}

	context.report({
		node: source.node,
		message,
		data: reportData,
		fix(fixer) {
			const fixes = [];
			if (expected !== 'before') {
				return fixes; // after almost never occurs, and when it does it causes conflicts
			}
			const sourceCode = context.getSourceCode();
			const sourceAfterToken = sourceCode.getTokenAfter(source.node);

			const sourceJSDoc = sourceCode
				.getCommentsBefore(source.node)
				.slice(-1)
				.pop();
			const targetJSDoc = sourceCode
				.getCommentsBefore(target.node)
				.slice(-1)
				.pop();
			const decorators = target.node.decorators || [];
			const targetDecorator = decorators.slice(-1).pop() || {};
			const insertTargetNode = targetJSDoc || targetDecorator.node || target.node;
			const sourceText = [];

			if (sourceJSDoc) {
				fixes.push(fixer.remove(sourceJSDoc));
				sourceText.push(
					`${sourceCode.getText(sourceJSDoc)}${determineNodeSeperator(sourceJSDoc, source.node)}`
				);
			}

			fixes.push(fixer.remove(source.node));
			sourceText.push(
				`${sourceCode.getText(source.node)}${determineNodeSeperator(source.node, sourceAfterToken)}`
			);
			fixes.push(fixer.insertTextBefore(insertTargetNode, sourceText.join('')));
			return fixes;
		},
	});
}

function determineNodeSeperator(first, second) {
	return isTokenOnSameLine(first, second) ? ' ' : '\n';
}

function isTokenOnSameLine(left, right) {
	return left.loc.end.line === right.loc.start.line;
}

function getMemberDescription(member, { groupAccessors }) {
	if (member.kind === 'constructor') {
		return 'constructor';
	}

	let typeName;
	if (member.matchingAccessor && groupAccessors) {
		typeName = 'accessor pair';
	} else if (isAccessor(member)) {
		typeName = `${member.kind}ter`;
	} else {
		typeName = member.type;
	}

	return `${member.static ? 'static ' : ''}${typeName} ${member.name}`;
}

function getClassMemberInfos(classDeclaration, sourceCode, orderedSlots) {
	const classMemberNodes = classDeclaration.body.body;

	const members = classMemberNodes
		.map((member, i) => ({ ...getMemberInfo(member, sourceCode), id: String(i) }))
		.map((memberInfo, i, memberInfos) => {
			matchAccessorPairs(memberInfos);
			const acceptableSlots = getAcceptableSlots(memberInfo, orderedSlots);
			return { ...memberInfo, acceptableSlots };
		});

	return members;
}

function getMemberInfo(node, sourceCode) {
	let name;
	let type;
	let propertyType;
	let async = false;
	let decorators = [];

	if (node.type === 'ClassProperty') {
		type = 'property';
		const [first, second] = sourceCode.getFirstTokens(node.key, 2);
		name = second && second.type === 'Identifier' ? second.value : first.value;
		propertyType = node.value ? node.value.type : node.value;
		decorators =
			(!!node.decorators &&
				node.decorators.map(n =>
					n.expression.type === 'CallExpression' ? n.expression.callee.name : n.expression.name
				)) ||
			[];
	} else {
		if (node.computed) {
			const keyBeforeToken = sourceCode.getTokenBefore(node.key);
			const keyAfterToken = sourceCode.getTokenAfter(node.key);
			name = sourceCode.getText().slice(keyBeforeToken.range[0], keyAfterToken.range[1]);
		} else {
			name = sourceCode.getText(node.key);
		}
		type = 'method';
		async = node.value && node.value.async;
	}

	return {
		name,
		type,
		decorators,
		static: node.static,
		async,
		kind: node.kind,
		propertyType,
		node,
	};
}

function findAccessorPairProblems(members, positioning) {
	const problems = [];
	if (positioning === 'any') {
		return problems;
	}

	forEachPair(members, (first, second, firstIndex, secondIndex) => {
		if (first.matchingAccessor === second.id) {
			const outOfOrder =
				(positioning === 'getThenSet' && first.kind !== 'get') ||
				(positioning === 'setThenGet' && first.kind !== 'set');
			const outOfPosition = secondIndex - firstIndex !== 1;

			if (outOfOrder || outOfPosition) {
				const expected = outOfOrder ? 'before' : 'after';
				problems.push({ source: second, target: first, expected });
			}
		}
	});

	return problems;
}

function findProblems(members) {
	const problems = [];

	forEachPair(members, (first, second) => {
		if (!areMembersInCorrectOrder(first, second)) {
			problems.push({ source: second, target: first, expected: 'before' });
		}
	});

	return problems;
}

function forEachPair(list, callback) {
	list.forEach((first, firstIndex) => {
		list.slice(firstIndex + 1).forEach((second, secondIndex) => {
			callback(first, second, firstIndex, firstIndex + secondIndex + 1);
		});
	});
}

function areMembersInCorrectOrder(first, second) {
	return first.acceptableSlots.some(a =>
		second.acceptableSlots.some(b =>
			a.index === b.index && areSlotsAlphabeticallySorted(a, b)
				? first.name.localeCompare(second.name) <= 0
				: a.index <= b.index
		)
	);
}

function areSlotsAlphabeticallySorted(a, b) {
	return a.sort === 'alphabetical' && b.sort === 'alphabetical';
}

function getAcceptableSlots(memberInfo, orderedSlots) {
	return orderedSlots
		.map((slot, index) => ({ index, score: scoreMember(memberInfo, slot), sort: slot.sort })) // check member against each slot
		.filter(({ score }) => score > 0) // discard slots that don't match
		.sort((a, b) => b.score - a.score) // sort best matching slots first
		.filter(({ score }, i, array) => score === array[0].score) // take top scoring slots
		.sort((a, b) => b.index - a.index);
}

function scoreMember(memberInfo, slot) {
	if (!Object.keys(slot).length) {
		return 1; // default/everything-else slot
	}

	const scores = comparers.map(({ property, value, test }) => {
		if (slot[property] !== undefined) {
			return test(memberInfo, slot) ? value : -1;
		}

		return 0;
	});

	if (scores.indexOf(-1) !== -1) {
		return -1;
	}

	return scores.reduce((a, b) => a + b);
}

function getExpectedOrder(order, groups) {
	return flatten(order.map(s => expandSlot(s, groups)));
}

function expandSlot(input, groups) {
	if (Array.isArray(input)) {
		return input.map(x => expandSlot(x, groups));
	}

	let slot;
	if (typeof input === 'string') {
		slot =
			input[0] === '[' // check for [groupName] shorthand
				? { group: input.substr(1, input.length - 2) }
				: { name: input };
	} else {
		slot = { ...input };
	}

	if (slot.group) {
		if (groups.hasOwnProperty(slot.group)) {
			return expandSlot(groups[slot.group], groups);
		}

		// ignore undefined groups
		return [];
	}

	const testName = slot.name && getNameComparer(slot.name);
	if (testName) {
		slot.testName = testName;
	}

	return [slot];
}

function isAccessor({ kind }) {
	return kind === 'get' || kind === 'set';
}

function matchAccessorPairs(members) {
	forEachPair(members, (first, second) => {
		const isMatch = first.name === second.name && first.static === second.static;
		if (isAccessor(first) && isAccessor(second) && isMatch) {
			first.isFirstAccessor = true;
			first.matchingAccessor = second.id;
			second.matchingAccessor = first.id;
		}
	});
}

function getNameComparer(name) {
	if (name[0] === '/') {
		let namePattern = name.substr(1, name.length - 2);

		if (namePattern[0] !== '^') {
			namePattern = `^${namePattern}`;
		}

		if (namePattern[namePattern.length - 1] !== '$') {
			namePattern += '$';
		}

		const re = new RegExp(namePattern);

		return n => re.test(n);
	}

	return n => n === name;
}

function flatten(collection) {
	const result = [];

	for (const item of collection) {
		if (Array.isArray(item)) {
			result.push(...flatten(item));
		} else {
			result.push(item);
		}
	}

	return result;
}

const builtInGroups = {
	constructor: { name: 'constructor', type: 'method' },
	properties: { type: 'property' },
	getters: { kind: 'get' },
	setters: { kind: 'set' },
	'accessor-pairs': { accessorPair: true },
	'static-properties': { type: 'property', static: true },
	'conventional-private-properties': { type: 'property', name: '/_.+/' },
	'arrow-function-properties': { propertyType: 'ArrowFunctionExpression' },
	methods: { type: 'method' },
	'static-methods': { type: 'method', static: true },
	'async-methods': { type: 'method', async: true },
	'conventional-private-methods': { type: 'method', name: '/_.+/' },
	'everything-else': {},
};

const comparers = [
	{ property: 'name', value: 100, test: (m, s) => s.testName(m.name) },
	{ property: 'type', value: 10, test: (m, s) => s.type === m.type },
	{ property: 'static', value: 10, test: (m, s) => s.static === m.static },
	{ property: 'async', value: 10, test: (m, s) => s.async === m.async },
	{ property: 'kind', value: 10, test: (m, s) => s.kind === m.kind },
	{
		property: 'groupByDecorator',
		value: 10,
		test: (m, s) => m.decorators.includes(s.groupByDecorator),
	},
	{
		property: 'accessorPair',
		value: 20,
		test: (m, s) =>
			(s.accessorPair && m.matchingAccessor) || (s.accessorPair === false && !m.matchingAccessor),
	},
	{
		property: 'propertyType',
		value: 11,
		test: (m, s) => m.type === 'property' && s.propertyType === m.propertyType,
	},
];

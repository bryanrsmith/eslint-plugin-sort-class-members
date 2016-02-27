import { sortClassMembersSchema } from './schema';

export const sortClassMembers = {
	getRule(defaults = {}) {
		function sortClassMembersRule(context) {
			let options = context.options[0] || {};
			let stopAfterFirst = !!options.stopAfterFirstProblem;
			let accessorPairPositioning = options.accessorPairPositioning || 'getThenSet';
			let order = options.order || defaults.order || [];
			let groups = { ...builtInGroups, ...defaults.groups, ...options.groups };
			let orderedSlots = getExpectedOrder(order, groups);
			let groupAccessors = accessorPairPositioning !== 'any';

			return {
				'ClassDeclaration'(node) {
					let members = getClassMemberInfos(node, context.getSourceCode(), orderedSlots);

					// check for out-of-order and separated get/set pairs
					let accessorPairProblems = findAccessorPairProblems(members, accessorPairPositioning);
					for (let problem of accessorPairProblems) {
						let message = 'Expected {{ source }} to come immediately {{ expected }} {{ target }}.';

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
					let problems = findProblems(members, orderedSlots);
					let problemCount = problems.length;
					for (let problem of problems) {
						let message = 'Expected {{ source }} to come {{ expected }} {{ target }}.';
						reportProblem({ problem, message, context, stopAfterFirst, problemCount, groupAccessors });

						if (stopAfterFirst) {
							break;
						}
					}
				},
			};
		}

		sortClassMembersRule.schema = sortClassMembersSchema;

		return sortClassMembersRule;
	},
};

function reportProblem({ problem, message, context, stopAfterFirst, problemCount, groupAccessors }) {
	let { source, target, expected } = problem;
	let reportData = {
		source: getMemberDescription(source, { groupAccessors }),
		target: getMemberDescription(target, { groupAccessors }),
		expected,
	};

	if (stopAfterFirst && problemCount > 1) {
		message += ' ({{ more }} similar {{ problem }} in this class)';
		reportData.more = problemCount - 1;
		reportData.problem = problemCount === 2 ? 'problem' : 'problems';
	}

	context.report({ node: source.node, message, data: reportData });
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
	let classMemberNodes = classDeclaration.body.body;

	let members = classMemberNodes
		.map((member, i) => ({ ...getMemberInfo(member, sourceCode), id: String(i) }))
		.map((memberInfo, i, memberInfos) => {
			matchAccessorPairs(memberInfos);
			let acceptableSlots = getAcceptableSlots(memberInfo, orderedSlots);
			return { ...memberInfo, acceptableSlots };
		});

	return members;
}

function getMemberInfo(node, sourceCode) {
	let name;
	let type;

	if (node.type === 'ClassProperty') {
		type = 'property';
		let [ first, second ] = sourceCode.getFirstTokens(node, 2);
		name = second.type === 'Identifier' ? second.value : first.value;
	} else {
		name = node.key.name;
		type = 'method';
	}

	return { name, type, static: node.static, kind: node.kind, node };
}

function findAccessorPairProblems(members, positioning) {
	let problems = [];
	if (positioning === 'any') {
		return problems;
	}

	forEachPair(members, (first, second, firstIndex, secondIndex) => {
		if (first.matchingAccessor === second.id) {
			let outOfOrder = (positioning === 'getThenSet' && first.kind !== 'get') ||
				(positioning === 'setThenGet' && first.kind !== 'set');
			let outOfPosition = secondIndex - firstIndex !== 1;

			if (outOfOrder || outOfPosition) {
				let expected = outOfOrder ? 'before' : 'after';
				problems.push({ source: second, target: first, expected });
			}
		}
	});

	return problems;
}

function findProblems(members) {
	let problems = [];

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
	return first.acceptableSlots.some(a => second.acceptableSlots.some(b => a <= b));
}

function getAcceptableSlots(memberInfo, orderedSlots) {
	return orderedSlots
		.map((slot, index) => ({ score: scoreMember(memberInfo, slot), index })) // check member against each slot
		.filter(({ score }) => score > 0) // discard slots that don't match
		.sort((a, b) => b.score - a.score) // sort best matching slots first
		.filter(({ score }, i, array) => score === array[0].score) // take top scoring slots
		.map(({ index }) => index) // we only need an array of slot indexes
		.sort();
}

function scoreMember(memberInfo, slot) {
	if (!Object.keys(slot).length) {
		return 1; // default/everything-else slot
	}

	let scores = comparers.map(({ property, value, test }) => {
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
		slot = input[0] === '[' // check for [groupName] shorthand
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

	let testName = slot.name && getNameComparer(slot.name);
	if (testName) {
		slot.testName = testName;
	}

	return [ slot ];
}

function isAccessor({ kind }) {
	return kind === 'get' || kind === 'set';
}

function matchAccessorPairs(members) {
	forEachPair(members, (first, second) => {
		let isMatch = first.name === second.name && first.static === second.static;
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
			namePattern = '^' + namePattern;
		}

		if (namePattern[namePattern.length - 1] !== '$') {
			namePattern += '$';
		}

		let re = new RegExp(namePattern);

		return n => re.test(n);
	}

	return n => n === name;
}

function flatten(collection) {
	let result = [];

	for (let item of collection) {
		if (Array.isArray(item)) {
			result.push(...flatten(item));
		} else {
			result.push(item);
		}
	}

	return result;
}

let builtInGroups = {
	'properties': { type: 'property' },
	'getters': { kind: 'get' },
	'setters': { kind: 'set' },
	'accessor-pairs': { accessorPair: true },
	'static-properties': { type: 'property', static: true },
	'conventional-private-properties': { type: 'property', name: '/_.+/' },
	'methods': { type: 'method' },
	'static-methods': { type: 'method', static: true },
	'conventional-private-methods': { type: 'method', name: '/_.+/' },
	'everything-else': {},
};

let comparers = [
	{ property: 'name', value: 100, test: (m, s) => s.testName(m.name) },
	{ property: 'type', value: 10, test: (m, s) => s.type === m.type },
	{ property: 'static', value: 10, test: (m, s) => s.static === m.static },
	{ property: 'kind', value: 10, test: (m, s) => s.kind === m.kind },
	{ property: 'accessorPair', value: 20, test: (m, s) => s.accessorPair && m.matchingAccessor },
];

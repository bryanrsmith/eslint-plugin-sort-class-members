import { sortClassMembersSchema } from './schema';

export const sortClassMembers = {
	getRule(defaults = {}) {
		function sortClassMembersRule(context) {
			let sourceCode = context.getSourceCode();
			let options = context.options[0] || {};
			let stopAfterFirst = !!options.stopAfterFirstProblem;
			let order = options.order || defaults.order || [];
			let groups = { ...builtInGroups, ...defaults.groups, ...options.groups };
			let orderedSlots = getExpectedOrder(order, groups);

			return {
				'ClassDeclaration'(node) {
					let classMemberNodes = node.body.body;

					let members = classMemberNodes
						.map(member => {
							let memberInfo = getMemberInfo(member, sourceCode);
							let acceptableSlots = getAcceptableSlots(memberInfo, orderedSlots);

							return { ...memberInfo, acceptableSlots };
						})
						// ignore members that don't match any slots
						.filter(member => member.acceptableSlots.length);

					let problems = findProblems(members, orderedSlots);
					let problemCount = problems.length;
					for (let { source, target, expected } of problems) {
						let reportData = {
							source: getMemberDescription(source),
							target: getMemberDescription(target),
							expected: expected,
						};

						let message = 'Expected {{ source }} to come {{ expected }} {{ target }}.';

						if (stopAfterFirst && problemCount > 1) {
							message += ' ({{ more }} similar {{ problem }} in this class)';
							reportData.more = problemCount - 1;
							reportData.problem = problemCount === 2 ? 'problem' : 'problems';
						}

						context.report({ node: source.node, message, data: reportData });

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

function getMemberDescription(memberInfo) {
	if (memberInfo.node.kind === 'constructor') {
		return 'constructor';
	}

	return `${memberInfo.static ? 'static ' : ''}${memberInfo.type} ${memberInfo.name}`;
}

function getMemberInfo(node, sourceCode) {
	let name;
	let type;

	if (node.type === 'ClassProperty') {
		type = 'property';
		let [first, second] = sourceCode.getFirstTokens(node, 2);
		name = second.type === 'Identifier' ? second.value : first.value;
	} else {
		name = node.key.name;
		type = 'method';
	}

	return { name, type, static: node.static, node };
}

function findProblems(members) {
	let problems = [];

	members.forEach((first, firstIndex) => {
		members.slice(firstIndex + 1).forEach((second) => {
			if (!areMembersInCorrectOrder(first, second)) {
				problems.push({ source: second, target: first, expected: 'before' });
			}
		});
	});

	return problems;
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

	return [slot];
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
];

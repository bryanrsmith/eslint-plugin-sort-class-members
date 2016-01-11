export default function memberOrder(context) {
	let sourceCode = context.getSourceCode();
	let options = context.options[0] || {};
	let orderedSlots = getExpectedOrder(options.order || defaultOrder, { ...defaultGroups, ...options.groups });

	return {
		'ClassDeclaration'(node) {
			let members = node.body.body.map(member => {
				let memberInfo = getMemberInfo(member, sourceCode);
				memberInfo.acceptableSlots = getAcceptableSlots(memberInfo, orderedSlots);

				return memberInfo;
			});

			for (let { source, target, expected } of findProblems(members, orderedSlots)) {
				let reportData = {
					source: getMemberDescription(source),
					target: getMemberDescription(target),
					expected: expected,
				};
				let message = 'Expected {{ source }} to come {{ expected }} {{ target }}.';
				context.report({ node: source.node, message, data: reportData });
			}
		},
	};
}

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
		.filter(({ score }) => score !== -1) // discard slots that don't match
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
	return order
		.map(s => expandSlot(s, groups))
		.reduce((collection, current) => [...collection, ...current], []);
}

function expandSlot(input, groups) {
	let slot = input;
	if (typeof input === 'string') {
		slot = input[0] === '[' // check for [groupName] shorthand
			? { group: input.substr(1, input.length - 2) }
			: { name: input };
	}

	if (slot.group) {
		if (groups.hasOwnProperty(slot.group)) {
			return expandSlot(groups[slot.group], groups);
		}

		// ignore undefined groups
		return [];
	}

	let testName = slot.name && getNameComparer(slot.name);

	return [{ ...slot, testName }];
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

let defaultOrder = [
	'[static-properties]',
	'[static-methods]',
	'[properties]',
	'[conventional-private-properties]',
	'constructor',
	'[methods]',
	'[conventional-private-methods]',
];

let defaultGroups = {
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

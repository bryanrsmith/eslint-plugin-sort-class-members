export const sortClassMembersSchema = [
	{
		id: 'https://github.com/bryanrsmith/eslint-plugin-sort-class-members/v1',
		type: 'object',
		properties: {
			order: { $ref: '#/definitions/order' },
			groups: {
				patternProperties: {
					'^.+$': { $ref: '#/definitions/order' },
				},
				additionalProperties: false,
			},
			stopAfterFirstProblem: {
				type: 'boolean',
			},
			accessorPairPositioning: {
				enum: ['getThenSet', 'setThenGet', 'together', 'any'],
			},
		},
		definitions: {
			order: {
				type: 'array',
				items: {
					anyOf: [
						{ type: 'string' },
						{
							type: 'object',
							properties: {
								name: { type: 'string' },
								groupByDecorator: { type: 'string' },
								type: { enum: ['method', 'property'] },
								kind: { enum: ['get', 'set'] },
								propertyType: { type: 'string' },
								accessorPair: { type: 'boolean' },
								sort: { enum: ['alphabetical', 'none'] },
								static: { type: 'boolean' },
								async: { type: 'boolean' },
							},
							additionalProperties: false,
						},
					],
				},
			},
		},
		additionalProperties: false,
	},
];

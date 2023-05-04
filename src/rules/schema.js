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
			locale: {
				type: 'string',
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
								groupByDecorator: { oneOf: [{type: 'string'}, {type: 'boolean'}] },
								type: { enum: ['method', 'property'] },
								kind: { enum: ['get', 'set', 'accessor', 'nonAccessor'] },
								propertyType: { type: 'string' },
								accessorPair: { type: 'boolean' },
								sort: { enum: ['alphabetical', 'none'] },
								static: { type: 'boolean' },
								private: { type: 'boolean' },
								async: { type: 'boolean' },
								accessibility: { enum: ['public', 'private', 'protected'] },
								abstract: { type: 'boolean' },
								override: { type: 'boolean' },
								readonly: { type: 'boolean' },
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

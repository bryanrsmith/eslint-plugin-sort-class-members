export let sortClassMembersSchema = [{
	type: 'object',
	properties: {
		order: { '$ref': '#/definitions/order' },
		groups: {
			patternProperties: {
				'^.+$': { '$ref': '#/definitions/order' },
			},
			additionalProperties: false,
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
							type: { enum: [ 'method', 'property' ]},
							static: { type: 'boolean' },
						},
						additionalProperties: false,
					},
				],
			},
		},
	},
	additionalProperties: false,
}];

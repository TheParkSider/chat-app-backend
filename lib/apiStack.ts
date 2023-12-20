import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as path from 'path';
import {
	GraphqlApi,
	Definition,
	AuthorizationType,
	FieldLogLevel,
	Resolver,
	Code,
	FunctionRuntime,
} from 'aws-cdk-lib/aws-appsync';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { IRole } from 'aws-cdk-lib/aws-iam';

import {
	Function,
	Runtime,
	Code as LambdaCode
} from 'aws-cdk-lib/aws-lambda'

interface APIStackProps extends StackProps {
	userpool: UserPool;
	roomTable: Table;
	userTable: Table;
	messageTable: Table;
	unauthenticatedRole: IRole;
}

export class APIStack extends Stack {
	constructor(scope: Construct, id: string, props: APIStackProps) {
		super(scope, id, props);

		const api = new GraphqlApi(this, 'ChatApp', {
			name: 'ChatApp',
			definition: Definition.fromFile(path.join(__dirname, 'graphql/schema.graphql')),
			authorizationConfig: {
				defaultAuthorization: {
					authorizationType: AuthorizationType.USER_POOL,
					userPoolConfig: {
						userPool: props.userpool,
					},
				},
			},
			logConfig: {
				fieldLogLevel: FieldLogLevel.ALL,
			},
			xrayEnabled: true,
		});

		const greeting = new Function(this, 'GreetingFunction', {
			runtime: Runtime.PYTHON_3_11,
			handler: 'greeting.handler',
			code: LambdaCode.fromAsset(
				path.join(__dirname, 'functions/greeting')
			),
		})

		const roomTableDataSource = api.addDynamoDbDataSource(
			'RoomTableDataSource',
			props.roomTable
		);
		const messageTableDataSource = api.addDynamoDbDataSource(
			'MessageTableDataSource',
			props.messageTable
		);
		const greetingFunctionDataSource = api.addLambdaDataSource(
			'GreetingFunctionDataSource',
			greeting
		)

		new Resolver(this, 'GreetingResolver', {
			api: api,
			dataSource: greetingFunctionDataSource,
			typeName: 'Query',
			fieldName: 'getGreeting',
			code: Code.fromAsset(
				path.join(__dirname, 'graphql/resolvers/Query.getGreeting.js')
			),
			runtime: FunctionRuntime.JS_1_0_0,
		})

		new Resolver(this, 'CreateRoomResolver', {
			api: api,
			dataSource: roomTableDataSource,
			typeName: 'Mutation',
			fieldName: 'createRoom',
			code: Code.fromAsset(
				path.join(__dirname, 'graphql/resolvers/Mutation.createRoom.js')
			),
			runtime: FunctionRuntime.JS_1_0_0,
		});

		new Resolver(this, 'ListRoomsResolver', {
			api: api,
			dataSource: roomTableDataSource,
			typeName: 'Query',
			fieldName: 'listRooms',
			code: Code.fromAsset(
				path.join(__dirname, 'graphql/resolvers/Query.listRooms.js')
			),
			runtime: FunctionRuntime.JS_1_0_0,
		});

		new Resolver(this, 'CreateMessageResolver', {
			api: api,
			dataSource: messageTableDataSource,
			typeName: 'Mutation',
			fieldName: 'createMessage',
			code: Code.fromAsset(
				path.join(__dirname, 'graphql/resolvers/Mutation.createMessage.js')
			),
			runtime: FunctionRuntime.JS_1_0_0,
		});

		new Resolver(this, 'ListMessageForRoomResolver', {
			api: api,
			dataSource: messageTableDataSource,
			typeName: 'Query',
			fieldName: 'listMessagesForRoom',
			code: Code.fromAsset(
				path.join(__dirname, 'graphql/resolvers/Query.listMessagesForRoom.js')
			),
			runtime: FunctionRuntime.JS_1_0_0,
		});

		new Resolver(this, 'UpdateMessageResolver', {
			api: api,
			dataSource: messageTableDataSource,
			typeName: 'Mutation',
			fieldName: 'updateMessage',
			code: Code.fromAsset(
				path.join(__dirname, 'graphql/resolvers/Mutation.updateMessage.js')
			),
			runtime: FunctionRuntime.JS_1_0_0,
		});

		new CfnOutput(this, 'GraphQLAPIURL', {
			value: api.graphqlUrl,
		});

		new CfnOutput(this, 'GraphQLAPIID', {
			value: api.apiId,
		});
	}
}

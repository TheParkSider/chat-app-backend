import { util } from '@aws-appsync/utils';

export function request(ctx) {
  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues({ id: ctx.args.input.id }),
    update: {
      expression: 'SET #updatedAt = :updatedAt, #content = :content',
      expressionNames: {
        '#updatedAt': 'updatedAt',
        '#content': 'content',
      },
      expressionValues: {
        ':updatedAt': util.dynamodb.toDynamoDB(util.time.nowISO8601()),
        ':content': util.dynamodb.toDynamoDB(ctx.args.input.content),
      },
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
}

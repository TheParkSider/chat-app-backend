import { util } from '@aws-appsync/utils';

export function request(ctx) {
  return {
    operation: 'Query',
    index: 'messages-by-room-id',
    query: {
      expression: 'roomId = :roomId',
      expressionValues: util.dynamodb.toMapValues({
        ':roomId': ctx.args.roomId,
      }),
    },
    scanIndexForward:
      ctx.args.sortDirection == null || ctx.args.sortDirection != 'DESC',
    nextToken: ctx.args.nextToken,
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
}

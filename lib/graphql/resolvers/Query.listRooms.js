import { util } from '@aws-appsync/utils';

export function request(ctx) {
  return {
    operation: 'Scan',
    limit: ctx.args.limit ?? 100,
    nextToken: ctx.args.nextToken,
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
}

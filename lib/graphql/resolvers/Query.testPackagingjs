import { util } from '@aws-appsync/utils';

export function request(ctx) {
  console.log(ctx);
  const { args } = ctx;

  return {
    operation: 'Invoke',
    payload: {
      name: args.name,
    },
  };
}

export function response(ctx) {
  const { result, error } = ctx;
  if (error) {
    util.error(error.message, error.type, result);
  }
  console.log(result);
  return result;
}

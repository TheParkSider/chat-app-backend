import json

def handler(event, context):
    print('request: {}'.format(json.dumps(event)))
    return f'Hello, {event["name"]}'

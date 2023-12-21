import json
# import pandas as pd
import requests

def handler(event, context):
    print('request: {}'.format(json.dumps(event)))

    return f'Hello, {event["name"]}'

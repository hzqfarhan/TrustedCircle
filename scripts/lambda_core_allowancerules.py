"""Core_GetAllowanceRules — GET /allowance/rules/{childId}
Lambda Proxy event: pathParameters = {childId}
"""
import json
import boto3
from decimal import Decimal
from datetime import datetime

dynamodb = boto3.resource('dynamodb')

def json_serial(obj):
    if isinstance(obj, Decimal):
        return float(obj) if obj % 1 else int(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f'Object of type {type(obj)} is not JSON serializable')

def lambda_handler(event, context):
    path_params = event.get('pathParameters') or {}
    child_id = path_params.get('childId')

    if not child_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing childId path parameter'})
        }

    table = dynamodb.Table('AllowanceRules')
    response = table.query(
        IndexName='childId-index',
        KeyConditionExpression='ChildId = :cid',
        ExpressionAttributeValues={':cid': child_id}
    )

    rules = response.get('Items', [])

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(rules, default=json_serial)
    }

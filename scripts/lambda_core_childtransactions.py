"""Core_GetChildTransactions — GET /child/{childId}/transactions
Lambda Proxy event: pathParameters = {childId}, queryStringParameters = {limit?}
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

    params = event.get('queryStringParameters') or {}
    limit = int(params.get('limit', 20))

    table = dynamodb.Table('Transactions')
    response = table.query(
        IndexName='childId-createdAt-index',
        KeyConditionExpression='ChildId = :cid',
        ExpressionAttributeValues={':cid': child_id},
        ScanIndexForward=False,
        Limit=limit
    )

    transactions = response.get('Items', [])

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(transactions, default=json_serial)
    }

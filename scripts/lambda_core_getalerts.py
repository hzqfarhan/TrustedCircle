"""Core_GetAlerts — GET /alerts
Lambda Proxy event: queryStringParameters = {parentId?, childId?, limit?}
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
    table = dynamodb.Table('Alerts')
    params = event.get('queryStringParameters') or {}
    parent_id = params.get('parentId')
    child_id = params.get('childId')
    limit = int(params.get('limit', 20))

    if parent_id:
        response = table.query(
            IndexName='parentId-createdAt-index',
            KeyConditionExpression='ParentId = :pid',
            ExpressionAttributeValues={':pid': parent_id},
            ScanIndexForward=False,
            Limit=limit
        )
    elif child_id:
        response = table.query(
            IndexName='childId-createdAt-index',
            KeyConditionExpression='ChildId = :cid',
            ExpressionAttributeValues={':cid': child_id},
            ScanIndexForward=False,
            Limit=limit
        )
    else:
        response = table.scan(Limit=limit)

    alerts = response.get('Items', [])

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(alerts, default=json_serial)
    }

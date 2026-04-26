"""Core_GetParentDashboard — GET /dashboard/parent/{childId}
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
            'body': json.dumps({'error': 'Missing childId in path'})
        }

    # Fetch child profile
    child_table = dynamodb.Table('ChildProfiles')
    child_resp = child_table.get_item(Key={'ChildId': child_id})
    child = child_resp.get('Item')

    if not child:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Child not found'})
        }

    # Fetch recent transactions
    tx_table = dynamodb.Table('Transactions')
    tx_resp = tx_table.query(
        IndexName='childId-createdAt-index',
        KeyConditionExpression='ChildId = :cid',
        ExpressionAttributeValues={':cid': child_id},
        ScanIndexForward=False,
        Limit=20
    )

    # Fetch allowance rules
    rules_table = dynamodb.Table('AllowanceRules')
    rules_resp = rules_table.query(
        IndexName='childId-index',
        KeyConditionExpression='ChildId = :cid',
        ExpressionAttributeValues={':cid': child_id}
    )

    # Fetch active goals
    goals_table = dynamodb.Table('Goals')
    goals_resp = goals_table.query(
        IndexName='childId-status-index',
        KeyConditionExpression='ChildId = :cid AND #status = :sts',
        ExpressionAttributeNames={'#status': 'Status'},
        ExpressionAttributeValues={':cid': child_id, ':sts': 'active'}
    )

    # Fetch unread alerts
    alerts_table = dynamodb.Table('Alerts')
    alerts_resp = alerts_table.query(
        IndexName='childId-createdAt-index',
        KeyConditionExpression='ChildId = :cid',
        FilterExpression='#read = :rd',
        ExpressionAttributeNames={'#read': 'Read'},
        ExpressionAttributeValues={':cid': child_id, ':rd': False},
        ScanIndexForward=False,
        Limit=5
    )

    dashboard = {
        'child': child,
        'transactions': tx_resp.get('Items', []),
        'allowanceRules': rules_resp.get('Items', []),
        'goals': goals_resp.get('Items', []),
        'alerts': alerts_resp.get('Items', [])
    }

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(dashboard, default=json_serial)
    }

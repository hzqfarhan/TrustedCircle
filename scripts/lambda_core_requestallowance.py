"""Core_RequestAllowance — POST /allowance/request
Lambda Proxy event: body = '{"childId", "parentId", "amount", "reason", ...}'
"""
import json
import boto3
import uuid
from decimal import Decimal
from datetime import datetime, timezone

dynamodb = boto3.resource('dynamodb')

def json_serial(obj):
    if isinstance(obj, Decimal):
        return float(obj) if obj % 1 else int(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f'Object of type {type(obj)} is not JSON serializable')

def lambda_handler(event, context):
    try:
        # Lambda Proxy: body is a JSON string
        body_str = event.get('body', '{}')
        body = json.loads(body_str) if isinstance(body_str, str) else body_str

        child_id = body.get('childId')
        parent_id = body.get('parentId')
        amount = Decimal(str(body.get('amount', 0)))
        reason = body.get('reason', '')
        category = body.get('category', '')

        if not child_id or amount <= 0:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'childId and positive amount are required'})
            }

        request_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        item = {
            'RequestId': request_id,
            'ChildId': child_id,
            'ParentId': parent_id or '',
            'Amount': amount,
            'Reason': reason,
            'Category': category,
            'Status': 'pending',
            'CreatedAt': now,
            'UpdatedAt': now
        }

        table = dynamodb.Table('ExtraAllowanceRequests')
        table.put_item(Item=item)

        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'id': request_id, 'status': 'pending'}, default=json_serial)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

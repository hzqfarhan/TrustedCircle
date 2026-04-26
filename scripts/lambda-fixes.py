# ─────────────────────────────────────────────────────────────
#  Corrected Lambda Functions — TrustedCircle
#  Paste each into the AWS Lambda Console (Python 3.14)
#  Region: ap-southeast-1
#
#  ⚠️  REQUIRED API GATEWAY CONFIGURATION:
#     ALL 5 routes MUST have "Lambda Proxy Integration" = ON
#     Without it, pathParameters / queryStringParameters
#     are NOT passed to Lambda.
# ─────────────────────────────────────────────────────────────

import json
import boto3
import uuid
from datetime import datetime, timezone
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')


# ─── Shared helper ────────────────────────────
def json_serial(obj):
    if isinstance(obj, Decimal):
        return float(obj) if obj % 1 else int(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f'Object of type {type(obj)} is not JSON serializable')


# ═══════════════════════════════════════════════
#  1. Core_GetAlerts — GET /alerts
#  EVENT: Lambda Proxy — queryStringParameters = {parentId?, childId?, limit?}
#  Bug was: GSI 'userId-createdAt-index' doesn't exist
#  Fix: use correct GSIs (parentId-createdAt-index / childId-createdAt-index)
# ═══════════════════════════════════════════════

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


# ═══════════════════════════════════════════════
#  2. Core_GetAllowanceRules — GET /allowance/rules/{childId}
#  EVENT: Lambda Proxy — pathParameters = {childId}
#  Bug was: GSI 'ChildId-index' (PascalCase), key 'childId' (lowercase)
#  Fix: GSI 'childId-index', key 'ChildId'
# ═══════════════════════════════════════════════

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


# ═══════════════════════════════════════════════
#  3. Core_GetChildTransactions — GET /child/{childId}/transactions
#  EVENT: Lambda Proxy — pathParameters = {childId}, queryStringParameters = {limit?}
#  Bug was: wrong GSI name and key casing
#  Fix: GSI 'childId-createdAt-index', key 'ChildId'
# ═══════════════════════════════════════════════

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


# ═══════════════════════════════════════════════
#  4. Core_RequestAllowance — POST /allowance/request
#  EVENT: Lambda Proxy — body = JSON string {"childId", "amount", "reason", ...}
#  Bug was: wrong table name → ResourceNotFoundException
#  Fix: use table 'ExtraAllowanceRequests'
# ═══════════════════════════════════════════════

def lambda_handler(event, context):
    try:
        body = event
        if isinstance(body, str):
            body = json.loads(body)
        if isinstance(body, dict) and 'body' in body:
            inner = body['body']
            if isinstance(inner, str):
                inner = json.loads(inner)
            body = inner

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


# ═══════════════════════════════════════════════
#  5. Core_GetParentDashboard — GET /dashboard/parent/{childId}
#  EVENT: Lambda Proxy — pathParameters = {childId}
#  Bug was: reading from queryStringParameters instead of pathParameters
#  Fix: read childId from event['pathParameters']
# ═══════════════════════════════════════════════

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


# ═══════════════════════════════════════════════════════════
#  DEPLOYMENT CHECKLIST — do these IN ORDER:
#
#  1. API Gateway Console → EACH route → Integration Request:
#     a) GET /alerts                    → Enable Lambda Proxy
#     b) GET /allowance/rules/{childId} → Change Lambda to Core_GetAllowanceRules
#                                          AND enable Lambda Proxy
#     c) GET /child/{childId}/transactions → Already Proxy ✅
#     d) POST /allowance/request           → Already Proxy ✅
#     e) GET /dashboard/parent/{childId}   → Already Proxy ✅
#     → DEPLOY API after all changes
#
#  2. Lambda Console → paste each corrected handler above:
#     a) Core_GetAlerts             → handler #1 + json_serial
#     b) Core_GetAllowanceRules     → handler #2 + json_serial
#     c) Core_GetChildTransactions  → handler #3 + json_serial
#     d) Core_RequestAllowance      → handler #4 + json_serial
#     e) Core_GetParentDashboard    → handler #5 + json_serial
#     → Each Lambda needs: handler + imports + json_serial
#
#  3. Test via curl/Postman against:
#     https://hjqu25msbk.execute-api.ap-southeast-1.amazonaws.com/v1
# ═══════════════════════════════════════════════════════════

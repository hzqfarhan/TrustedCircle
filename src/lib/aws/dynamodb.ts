// ─────────────────────────────────────────────
//  DynamoDB Client — AWS SDK v3
// ─────────────────────────────────────────────

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import type { NativeAttributeValue } from '@aws-sdk/lib-dynamodb';
import { getMockTable } from './mock-data';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  ...(process.env.DYNAMODB_ENDPOINT && {
    endpoint: process.env.DYNAMODB_ENDPOINT,
  }),
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

// ─── Table names from env ────────────────────
export const Tables = {
  profiles: process.env.DYNAMODB_PROFILES_TABLE || 'smart-wallet-profiles',
  childProfiles: process.env.DYNAMODB_CHILD_PROFILES_TABLE || 'smart-wallet-child-profiles',
  parentChildLinks: process.env.DYNAMODB_PARENT_CHILD_LINKS_TABLE || 'smart-wallet-parent-child-links',
  transactions: process.env.DYNAMODB_TRANSACTIONS_TABLE || 'smart-wallet-transactions',
  allowanceRules: process.env.DYNAMODB_ALLOWANCE_RULES_TABLE || 'smart-wallet-allowance-rules',
  recommendations: process.env.DYNAMODB_ALLOWANCE_RECOMMENDATIONS_TABLE || 'smart-wallet-allowance-recommendations',
  extraRequests: process.env.DYNAMODB_EXTRA_ALLOWANCE_REQUESTS_TABLE || 'smart-wallet-extra-allowance-requests',
  goals: process.env.DYNAMODB_GOALS_TABLE || 'smart-wallet-goals',
  badges: process.env.DYNAMODB_BADGES_TABLE || 'smart-wallet-badges',
  childBadges: process.env.DYNAMODB_CHILD_BADGES_TABLE || 'smart-wallet-child-badges',
  alerts: process.env.DYNAMODB_ALERTS_TABLE || 'smart-wallet-alerts',
  auditLogs: process.env.DYNAMODB_AUDIT_LOGS_TABLE || 'smart-wallet-audit-logs',
} as const;

// ─── Generic helpers ─────────────────────────

export async function getItem<T>(table: string, key: Record<string, NativeAttributeValue>): Promise<T | null> {
  if (process.env.USE_MOCK_DB !== 'false') {
    const mockTable = getMockTable(table);
    const keyName = Object.keys(key)[0];
    const keyValue = key[keyName];
    const found = mockTable.find(item => item[keyName] === keyValue);
    return (found as T) || null;
  }
  const result = await docClient.send(new GetCommand({ TableName: table, Key: key }));
  return (result.Item as T) || null;
}

export async function putItem(table: string, item: Record<string, NativeAttributeValue>): Promise<void> {
  if (process.env.USE_MOCK_DB !== 'false') {
    const mockTable = getMockTable(table);
    // Overwrite if exists, else push
    const idKey = item.id ? 'id' : Object.keys(item)[0];
    const existingIdx = mockTable.findIndex(i => i[idKey] === item[idKey]);
    if (existingIdx >= 0) {
      mockTable[existingIdx] = item;
    } else {
      mockTable.push(item);
    }
    return;
  }
  await docClient.send(new PutCommand({ TableName: table, Item: item }));
}

export async function updateItem(
  table: string,
  key: Record<string, NativeAttributeValue>,
  updates: Record<string, NativeAttributeValue>
): Promise<void> {
  const expressions: string[] = [];
  const names: Record<string, string> = {};
  const values: Record<string, NativeAttributeValue> = {};

  Object.entries(updates).forEach(([k, v]) => {
    const attrName = `#${k}`;
    const attrVal = `:${k}`;
    expressions.push(`${attrName} = ${attrVal}`);
    names[attrName] = k;
    values[attrVal] = v;
  });

  if (process.env.USE_MOCK_DB !== 'false') {
    const mockTable = getMockTable(table);
    const keyName = Object.keys(key)[0];
    const keyValue = key[keyName];
    const existing = mockTable.find(item => item[keyName] === keyValue);
    if (existing) {
      Object.assign(existing, updates);
    }
    return;
  }

  await docClient.send(
    new UpdateCommand({
      TableName: table,
      Key: key,
      UpdateExpression: `SET ${expressions.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  );
}

export async function deleteItem(table: string, key: Record<string, NativeAttributeValue>): Promise<void> {
  if (process.env.USE_MOCK_DB !== 'false') {
    const mockTable = getMockTable(table);
    const keyName = Object.keys(key)[0];
    const keyValue = key[keyName];
    const existingIdx = mockTable.findIndex(item => item[keyName] === keyValue);
    if (existingIdx >= 0) {
      mockTable.splice(existingIdx, 1);
    }
    return;
  }
  await docClient.send(new DeleteCommand({ TableName: table, Key: key }));
}

export async function queryItems<T>(
  table: string,
  indexName: string | undefined,
  keyCondition: string,
  expressionValues: Record<string, NativeAttributeValue>,
  options?: {
    scanForward?: boolean;
    limit?: number;
    expressionNames?: Record<string, string>;
    filterExpression?: string;
  }
): Promise<T[]> {
  if (process.env.USE_MOCK_DB !== 'false') {
    const mockTable = getMockTable(table);
    // Very basic query mock: assumes keyCondition uses the same keys as expressionValues without complex operators
    let results = mockTable.filter(item => {
      let matches = true;
      for (const [k, v] of Object.entries(expressionValues)) {
        // Strip the ':' prefix to get the property name
        const propName = k.replace(':', '');
        if (item[propName] !== v) {
          matches = false;
          break;
        }
      }
      return matches;
    });

    if (options?.scanForward === false) {
      // Simplistic reverse sort
      results = results.reverse();
    }
    if (options?.limit) {
      results = results.slice(0, options.limit);
    }
    return (results as T[]);
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: table,
      IndexName: indexName,
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: expressionValues,
      ScanIndexForward: options?.scanForward ?? false,
      Limit: options?.limit,
      ExpressionAttributeNames: options?.expressionNames,
      FilterExpression: options?.filterExpression,
    })
  );
  return (result.Items as T[]) || [];
}

export async function scanItems<T>(table: string, limit?: number): Promise<T[]> {
  if (process.env.USE_MOCK_DB !== 'false') {
    const mockTable = getMockTable(table);
    return limit ? (mockTable.slice(0, limit) as T[]) : (mockTable as T[]);
  }
  const result = await docClient.send(
    new ScanCommand({ TableName: table, Limit: limit })
  );
  return (result.Items as T[]) || [];
}

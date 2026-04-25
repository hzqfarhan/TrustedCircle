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
import { GetMockTable } from './mock-data';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  ...(process.env.DYNAMODB_ENDPOINT && {
    endpoint: process.env.DYNAMODB_ENDPOINT,
  }),
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

// ─── Table names from env (PascalCase as per requirement) ────────────────────
export const Tables = {
  profiles: process.env.DYNAMODB_PROFILES_TABLE || 'JuniorWallet-Profiles',
  childProfiles: process.env.DYNAMODB_CHILD_PROFILES_TABLE || 'JuniorWallet-ChildProfiles',
  parentChildLinks: process.env.DYNAMODB_PARENT_CHILD_LINKS_TABLE || 'JuniorWallet-ParentChildLinks',
  transactions: process.env.DYNAMODB_TRANSACTIONS_TABLE || 'JuniorWallet-Transactions',
  allowanceRules: process.env.DYNAMODB_ALLOWANCE_RULES_TABLE || 'JuniorWallet-AllowanceRules',
  recommendations: process.env.DYNAMODB_ALLOWANCE_RECOMMENDATIONS_TABLE || 'JuniorWallet-AllowanceRecommendations',
  extraRequests: process.env.DYNAMODB_EXTRA_ALLOWANCE_REQUESTS_TABLE || 'JuniorWallet-ExtraAllowanceRequests',
  goals: process.env.DYNAMODB_GOALS_TABLE || 'JuniorWallet-Goals',
  badges: process.env.DYNAMODB_BADGES_TABLE || 'JuniorWallet-Badges',
  childBadges: process.env.DYNAMODB_CHILD_BADGES_TABLE || 'JuniorWallet-ChildBadges',
  alerts: process.env.DYNAMODB_ALERTS_TABLE || 'JuniorWallet-Alerts',
  auditLogs: process.env.DYNAMODB_AUDIT_LOGS_TABLE || 'JuniorWallet-AuditLogs',
  kycDocuments: process.env.DYNAMODB_CHILD_KYC_DOCUMENTS_TABLE || 'JuniorWallet-ChildKycDocuments',
} as const;

// ─── Case-insensitive MockDB property lookup ─────────────────
function mockLookup(item: Record<string, any>, key: string, value: any): boolean {
  return Object.entries(item).some(([k, v]) => k.toLowerCase() === key.toLowerCase() && v === value);
}

/** Match every key-value entry for MockDB (supports compound keys) */
function mockMatch(item: Record<string, any>, kvs: Record<string, any>): boolean {
  return Object.entries(kvs).every(([k, v]) => mockLookup(item, k, v));
}

// ─── Generic helpers (PascalCase methods) ─────────────────────────

export async function GetItem<T>(table: string, key: Record<string, NativeAttributeValue>): Promise<T | null> {
  if (process.env.USE_MOCK_DB !== 'false') {
    const mockTable = GetMockTable(table);
    const found = mockTable.find(item => mockMatch(item, key));
    return (found || null) as T | null;
  }
  const result = await docClient.send(new GetCommand({ TableName: table, Key: key }));
  return (result.Item || null) as T | null;
}

export async function PutItem(table: string, item: Record<string, NativeAttributeValue>): Promise<void> {
  if (process.env.USE_MOCK_DB !== 'false') {
    const mockTable = GetMockTable(table);
    const pk = Object.keys(item)[0];
    const existingIdx = mockTable.findIndex(i => mockLookup(i, pk, item[pk]));
    if (existingIdx >= 0) {
      mockTable[existingIdx] = item;
    } else {
      mockTable.push(item);
    }
    return;
  }
  await docClient.send(new PutCommand({ TableName: table, Item: item }));
}

export async function UpdateItem(
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
    const mockTable = GetMockTable(table);
    const existing = mockTable.find(item => mockMatch(item, key));
    if (existing) Object.assign(existing, updates);
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

export async function DeleteItem(table: string, key: Record<string, NativeAttributeValue>): Promise<void> {
  if (process.env.USE_MOCK_DB !== 'false') {
    const mockTable = GetMockTable(table);
    const existingIdx = mockTable.findIndex(item => mockMatch(item, key));
    if (existingIdx >= 0) mockTable.splice(existingIdx, 1);
    return;
  }
  await docClient.send(new DeleteCommand({ TableName: table, Key: key }));
}

export async function QueryItems<T>(
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
    const mockTable = GetMockTable(table);
    // Simple mock filter logic
    let results = mockTable.filter(item => {
      // In a real mock, we'd parse the condition, but for now we just filter by the values provided
      return Object.entries(expressionValues).every(([k, v]) => {
        const prop = k.startsWith(':') ? k.slice(1) : k;
        return mockLookup(item, prop, v);
      });
    });
    if (options?.scanForward === false) results = results.reverse();
    if (options?.limit) results = results.slice(0, options.limit);
    return results as T[];
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
  return (result.Items || []) as T[];
}

export async function ScanItems<T>(table: string, limit?: number): Promise<T[]> {
  if (process.env.USE_MOCK_DB !== 'false') {
    const mockTable = GetMockTable(table);
    return (limit ? mockTable.slice(0, limit) : mockTable) as T[];
  }
  const result = await docClient.send(new ScanCommand({ TableName: table, Limit: limit }));
  return (result.Items || []) as T[];
}

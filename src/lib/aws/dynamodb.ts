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

// ─── Case-conversion helpers ─────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function camelToPascal(s: string): string {
  return capitalize(s);
}

function pascalToCamel(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** Convert GSI name from `childId-createdAt-index` → `ChildIdCreatedAtIndex` */
function gsiToPascal(name: string): string {
  return name.split('-').map(w => capitalize(w)).join('');
}

const DB_KEYWORDS = new Set([
  'AND', 'OR', 'NOT', 'BETWEEN', 'IN', 'BEGINS_WITH', 'CONTAINS',
  'EQ', 'NE', 'LE', 'LT', 'GE', 'GT', 'IS', 'NULL',
  'SIZE', 'ATTRIBUTE_EXISTS', 'ATTRIBUTE_NOT_EXISTS',
]);

/** Convert `childId = :childId AND createdAt BETWEEN :start AND :end`
 *  → `ChildId = :ChildId AND CreatedAt BETWEEN :Start AND :End` */
function kceToPascal(condition: string): string {
  let r = condition.replace(/:([a-zA-Z]+)/g, (_, n) => `:${capitalize(n)}`);
  r = r.replace(/#([a-zA-Z]+)/g, (_, n) => `#${capitalize(n)}`);
  return r.replace(/\b([a-zA-Z]+)\b/g, (m) =>
    DB_KEYWORDS.has(m.toUpperCase()) ? m : capitalize(m)
  );
}

/** Shallow key-map on an object: `{ id: v }` → `{ Id: v }` */
function mapKeys<T extends Record<string, any>>(obj: T, fn: (k: string) => string): Record<string, any> {
  const r: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) r[fn(k)] = v;
  return r;
}

/** Convert `{ ':childId': v }` → `{ ':ChildId': v }` */
function expValuesToPascal(vals: Record<string, any>): Record<string, any> {
  const r: Record<string, any> = {};
  for (const [k, v] of Object.entries(vals)) r[`${k[0]}${capitalize(k.slice(1))}`] = v;
  return r;
}

/** Recursively convert all keys in an object/array to camelCase */
function deepToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(deepToCamel);
  if (obj !== null && typeof obj === 'object') {
    const r: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) r[pascalToCamel(k)] = deepToCamel(v);
    return r;
  }
  return obj;
}

/** Case-insensitive MockDB property lookup */
function mockLookup(item: Record<string, any>, key: string, value: any): boolean {
  return Object.entries(item).some(([k, v]) => k.toLowerCase() === key.toLowerCase() && v === value);
}

/** Match every key-value entry for MockDB (supports compound keys) */
function mockMatch(item: Record<string, any>, kvs: Record<string, any>): boolean {
  return Object.entries(kvs).every(([k, v]) => mockLookup(item, k, v));
}

// ─── Generic helpers ─────────────────────────

export async function getItem<T>(table: string, key: Record<string, NativeAttributeValue>): Promise<T | null> {
  const pascalKey = mapKeys(key, camelToPascal);

  if (process.env.USE_MOCK_DB !== 'false') {
    const mockTable = getMockTable(table);
    const found = mockTable.find(item => mockMatch(item, pascalKey));
    return (found ? deepToCamel(found) : null) as T | null;
  }
  const result = await docClient.send(new GetCommand({ TableName: table, Key: pascalKey }));
  return (result.Item ? deepToCamel(result.Item) : null) as T | null;
}

export async function putItem(table: string, item: Record<string, NativeAttributeValue>): Promise<void> {
  const pascalItem = mapKeys(item, camelToPascal);

  if (process.env.USE_MOCK_DB !== 'false') {
    const mockTable = getMockTable(table);
    const pk = Object.keys(pascalItem)[0];
    const existingIdx = mockTable.findIndex(i => mockLookup(i, pk, pascalItem[pk]));
    if (existingIdx >= 0) {
      mockTable[existingIdx] = pascalItem;
    } else {
      mockTable.push(pascalItem);
    }
    return;
  }
  await docClient.send(new PutCommand({ TableName: table, Item: pascalItem }));
}

export async function updateItem(
  table: string,
  key: Record<string, NativeAttributeValue>,
  updates: Record<string, NativeAttributeValue>
): Promise<void> {
  const pascalKey = mapKeys(key, camelToPascal);
  const pascalUpdates = mapKeys(updates, camelToPascal);

  const expressions: string[] = [];
  const names: Record<string, string> = {};
  const values: Record<string, NativeAttributeValue> = {};

  Object.entries(pascalUpdates).forEach(([k, v]) => {
    const attrName = `#${k}`;
    const attrVal = `:${k}`;
    expressions.push(`${attrName} = ${attrVal}`);
    names[attrName] = k;
    values[attrVal] = v;
  });

  if (process.env.USE_MOCK_DB !== 'false') {
    const mockTable = getMockTable(table);
    const existing = mockTable.find(item => mockMatch(item, pascalKey));
    if (existing) Object.assign(existing, pascalUpdates);
    return;
  }

  await docClient.send(
    new UpdateCommand({
      TableName: table,
      Key: pascalKey,
      UpdateExpression: `SET ${expressions.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    })
  );
}

export async function deleteItem(table: string, key: Record<string, NativeAttributeValue>): Promise<void> {
  const pascalKey = mapKeys(key, camelToPascal);

  if (process.env.USE_MOCK_DB !== 'false') {
    const mockTable = getMockTable(table);
    const existingIdx = mockTable.findIndex(item => mockMatch(item, pascalKey));
    if (existingIdx >= 0) mockTable.splice(existingIdx, 1);
    return;
  }
  await docClient.send(new DeleteCommand({ TableName: table, Key: pascalKey }));
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
  const pascalIndex = indexName ? gsiToPascal(indexName) : undefined;
  const pascalCondition = kceToPascal(keyCondition);
  const pascalValues = expValuesToPascal(expressionValues);
  const pascalExpNames = options?.expressionNames
    ? Object.fromEntries(
        Object.entries(options.expressionNames).map(([k, v]) => [k.replace(/#([a-zA-Z]+)/g, (_, n) => `#${capitalize(n)}`), camelToPascal(v)])
      )
    : undefined;
  const pascalFilter = options?.filterExpression ? kceToPascal(options.filterExpression) : undefined;

  if (process.env.USE_MOCK_DB !== 'false') {
    const mockTable = getMockTable(table);
    let results = mockTable.filter(item => {
      for (const [k, v] of Object.entries(pascalValues)) {
        const propName = k.replace(':', '');
        if (!mockLookup(item, propName, v)) return false;
      }
      return true;
    });
    if (options?.scanForward === false) results = results.reverse();
    if (options?.limit) results = results.slice(0, options.limit);
    return deepToCamel(results) as T[];
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: table,
      IndexName: pascalIndex,
      KeyConditionExpression: pascalCondition,
      ExpressionAttributeValues: pascalValues,
      ScanIndexForward: options?.scanForward ?? false,
      Limit: options?.limit,
      ExpressionAttributeNames: pascalExpNames,
      FilterExpression: pascalFilter,
    })
  );
  return (result.Items ? deepToCamel(result.Items) : []) as T[];
}

export async function scanItems<T>(table: string, limit?: number): Promise<T[]> {
  if (process.env.USE_MOCK_DB !== 'false') {
    const mockTable = getMockTable(table);
    return deepToCamel(limit ? mockTable.slice(0, limit) : mockTable) as T[];
  }
  const result = await docClient.send(new ScanCommand({ TableName: table, Limit: limit }));
  return (result.Items ? deepToCamel(result.Items) : []) as T[];
}

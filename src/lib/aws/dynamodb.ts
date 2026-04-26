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
import { fromIni } from '@aws-sdk/credential-providers';
import { getMockTable } from './mock-data';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  ...(process.env.DYNAMODB_ENDPOINT && {
    endpoint: process.env.DYNAMODB_ENDPOINT,
  }),
  // Use AWS SSO profile when available, otherwise env vars, otherwise default chain
  ...(process.env.AWS_PROFILE
    ? { credentials: fromIni({ profile: process.env.AWS_PROFILE }) }
    : process.env.AWS_ACCESS_KEY_ID
      ? {
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            ...(process.env.AWS_SESSION_TOKEN && {
              sessionToken: process.env.AWS_SESSION_TOKEN,
            }),
          },
        }
    : {}),
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

// ─── Table names from env ────────────────────
export const Tables = {
  profiles: process.env.DYNAMODB_PROFILES_TABLE || 'Users',
  childProfiles: process.env.DYNAMODB_CHILD_PROFILES_TABLE || 'ChildProfiles',
  parentChildLinks: process.env.DYNAMODB_PARENT_CHILD_LINKS_TABLE || 'UserChildLink',
  transactions: process.env.DYNAMODB_TRANSACTIONS_TABLE || 'Transactions',
  allowanceRules: process.env.DYNAMODB_ALLOWANCE_RULES_TABLE || 'AllowanceRules',
  recommendations: process.env.DYNAMODB_ALLOWANCE_RECOMMENDATIONS_TABLE || 'AllowanceRecommendations',
  extraRequests: process.env.DYNAMODB_EXTRA_ALLOWANCE_REQUESTS_TABLE || 'ExtraAllowanceRequests',
  goals: process.env.DYNAMODB_GOALS_TABLE || 'Goals',
  badges: process.env.DYNAMODB_BADGES_TABLE || 'Badges',
  childBadges: process.env.DYNAMODB_CHILD_BADGES_TABLE || 'ChildBadges',
  alerts: process.env.DYNAMODB_ALERTS_TABLE || 'Alerts',
  auditLogs: process.env.DYNAMODB_AUDIT_LOGS_TABLE || 'AuditLogs',
  kycDocuments: process.env.DYNAMODB_CHILD_KYC_DOCUMENTS_TABLE || 'KYCDocuments',
  sharedFunds: process.env.DYNAMODB_SHARED_FUNDS_TABLE || 'SharedFunds',
  approvals: process.env.DYNAMODB_APPROVALS_TABLE || 'Approvals',
} as const;

// ─── PK mapping: normalized table name → DynamoDB partition key ───

function normalizeTable(name: string): string {
  return name.replace(/^(smart-wallet-|juniorwallet-)/, '').replace(/-/g, '').toLowerCase();
}

const TABLE_PK_MAP: Record<string, string> = {
  profiles:          'UserId',
  users:             'UserId',
  childprofiles:     'ChildId',
  parentchildlinks:  'UserChildLinkId',
  userchildlink:     'UserChildLinkId',
  transactions:      'TransactionId',
  allowancerules:    'RuleId',
  allowancerecommendations: 'AllowanceRecommendationsId',
  extraallowancerequests:   'RequestId',
  allowancerequests: 'RequestId',
  extraallowancerequest:    'RequestId',
  goals:             'GoalId',
  badges:            'BadgesId',
  childbadges:       'ChildBadgesId',
  alerts:            'AlertId',
  auditlogs:         'AuditLogId',
  childkycdocuments: 'KycDocumentId',
  kycdocuments:      'KycDocumentId',
  sharedfunds:       'SharedFundId',
  approvals:         'ApprovalId',
};

function getTablePK(table: string): string {
  return TABLE_PK_MAP[normalizeTable(table)] || 'Id';
}

/** Convert generic key `{ Id: v }` → `{ ChildId: v }` per table PK */
function toTableKey(table: string, pascalKey: Record<string, any>): Record<string, any> {
  const pkName = getTablePK(table);
  if (pkName === 'Id') return pascalKey;
  const value = pascalKey['Id'] ?? Object.values(pascalKey)[0];
  return { [pkName]: value };
}

/** Fix item's `Id` field to match the table's actual PK name */
function fixItemPK(table: string, item: Record<string, any>): Record<string, any> {
  const pkName = getTablePK(table);
  if (pkName === 'Id' || !('Id' in item)) return item;
  const { Id, ...rest } = item;
  return { [pkName]: Id, ...rest };
}

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
export function deepToCamel(obj: any): any {
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

/** After deepToCamel, rename the descriptive PK (e.g. 'userId') back to 'id'
 *  so the returned object matches the TypeScript interface which expects `id`. */
function remapPKToId(table: string, obj: any): any {
  if (!obj) return obj;
  const pkCamel = pascalToCamel(getTablePK(table));
  if (pkCamel === 'id' || !(pkCamel in obj)) return obj;
  const { [pkCamel]: idValue, ...rest } = obj;
  return { id: idValue, ...rest };
}

function remapPKToIdArray(table: string, arr: any[]): any[] {
  return arr.map(item => remapPKToId(table, item));
}

// ─── Generic helpers ─────────────────────────

export async function getItem<T>(table: string, key: Record<string, NativeAttributeValue>): Promise<T | null> {
  const pascalKey = toTableKey(table, mapKeys(key, camelToPascal));

  if (process.env.USE_MOCK_DB !== 'false') {
    const mockTable = getMockTable(table);
    const found = mockTable.find(item => mockMatch(item, pascalKey));
    return (found ? remapPKToId(table, deepToCamel(found)) : null) as T | null;
  }
  const result = await docClient.send(new GetCommand({ TableName: table, Key: pascalKey }));
  return (result.Item ? remapPKToId(table, deepToCamel(result.Item)) : null) as T | null;
}

export async function putItem(table: string, item: Record<string, any>): Promise<void> {
  const pascalItem = fixItemPK(table, mapKeys(item, camelToPascal));

  if (process.env.USE_MOCK_DB !== 'false') {
    const mockTable = getMockTable(table);
    const pk = getTablePK(table);
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
  const pascalKey = toTableKey(table, mapKeys(key, camelToPascal));
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
  const pascalKey = toTableKey(table, mapKeys(key, camelToPascal));

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
  const pascalIndex = indexName;  // GSI names on AWS are already camelCase-dash (e.g. childId-createdAt-index)
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

    // Apply filterExpression for MockDB (supports simple equalities like #read = :read)
    if (pascalFilter && pascalExpNames) {
      const filterValueKeys = Array.from(pascalFilter.matchAll(/:([A-Z][a-zA-Z]*)/g));
      if (filterValueKeys.length > 0) {
        results = results.filter(item => {
          for (const match of filterValueKeys) {
            const fullKey = match[0]; // e.g. ':Read'
            const value = pascalValues[fullKey];
            if (value === undefined) continue;
            // Find what property name this :Key maps to via filter expression
            // Parse `#Read = :Read` → find #Read → look up expressionNames → 'Read' → check item['Read']
            const expNameMatches = Array.from(pascalFilter.matchAll(/#([A-Z][a-zA-Z]*)\s*=\s*(:[A-Z][a-zA-Z]*)/g));
            for (const [,, expKey, valKey] of expNameMatches) {
              if (valKey === fullKey) {
                const propName = pascalExpNames[`#${expKey}`];
                if (propName && !mockLookup(item, propName, value)) return false;
              }
            }
          }
          return true;
        });
      }
    }

    if (options?.scanForward === false) results = results.reverse();
    if (options?.limit) results = results.slice(0, options.limit);
    return remapPKToIdArray(table, deepToCamel(results)) as T[];
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
  return (result.Items ? remapPKToIdArray(table, deepToCamel(result.Items)) : []) as T[];
}

export async function scanItems<T>(table: string, limit?: number): Promise<T[]> {
  if (process.env.USE_MOCK_DB !== 'false') {
    const mockTable = getMockTable(table);
    return remapPKToIdArray(table, deepToCamel(limit ? mockTable.slice(0, limit) : mockTable)) as T[];
  }
  const result = await docClient.send(new ScanCommand({ TableName: table, Limit: limit }));
  return (result.Items ? remapPKToIdArray(table, deepToCamel(result.Items)) : []) as T[];
}

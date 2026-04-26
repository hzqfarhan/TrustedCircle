// ─────────────────────────────────────────────
//  AWS CDK Stack — Smart Wallet Infrastructure
// ─────────────────────────────────────────────

import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class SmartWalletStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ── Cognito User Pool ──
    const userPool = new cognito.UserPool(this, 'SmartWalletUserPool', {
      userPoolName: 'smart-wallet-user-pool',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: { minLength: 8, requireUppercase: true, requireDigits: true, requireSymbols: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      customAttributes: { role: new cognito.StringAttribute({ mutable: true }) },
    });

    const userPoolClient = userPool.addClient('SmartWalletClient', {
      userPoolClientName: 'smart-wallet-client',
      authFlows: { adminUserPassword: true, userPassword: true, userSrp: true },
      generateSecret: false,
    });

    // ── Helper to create DynamoDB tables ──
    const createTable = (name: string, partitionKey: string, sortKey?: string, gsis?: { name: string; pk: string; sk?: string }[]) => {
      const table = new dynamodb.Table(this, name, {
        tableName: name,
        partitionKey: { name: partitionKey, type: dynamodb.AttributeType.STRING },
        ...(sortKey && { sortKey: { name: sortKey, type: dynamodb.AttributeType.STRING } }),
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });
      gsis?.forEach((gsi) => {
        table.addGlobalSecondaryIndex({
          indexName: gsi.name,
          partitionKey: { name: gsi.pk, type: dynamodb.AttributeType.STRING },
          ...(gsi.sk && { sortKey: { name: gsi.sk, type: dynamodb.AttributeType.STRING } }),
        });
      });
      return table;
    };

    // ── DynamoDB Tables ──
    createTable('Users', 'UserId', undefined, [{ name: 'role-index', pk: 'Role' }]);
    createTable('ChildProfiles', 'ChildId', undefined, [{ name: 'parentId-index', pk: 'ParentId' }, { name: 'userId-index', pk: 'UserId' }]);
    createTable('UserChildLink', 'UserChildLinkId', undefined, [{ name: 'parentId-index', pk: 'ParentId' }, { name: 'childId-index', pk: 'ChildId' }]);
    createTable('Transactions', 'TransactionId', undefined, [{ name: 'childId-createdAt-index', pk: 'ChildId', sk: 'CreatedAt' }]);
    createTable('AllowanceRules', 'RuleId', undefined, [{ name: 'childId-index', pk: 'ChildId' }]);
    createTable('AllowanceRecommendations', 'AllowanceRecommendationsId', undefined, [{ name: 'childId-createdAt-index', pk: 'ChildId', sk: 'CreatedAt' }, { name: 'status-index', pk: 'Status' }]);
    createTable('ExtraAllowanceRequests', 'RequestId', undefined, [{ name: 'childId-createdAt-index', pk: 'ChildId', sk: 'CreatedAt' }, { name: 'parentId-status-index', pk: 'ParentId', sk: 'Status' }]);
    createTable('Goals', 'GoalId', undefined, [{ name: 'childId-status-index', pk: 'ChildId', sk: 'Status' }]);
    createTable('Badges', 'BadgesId');
    createTable('ChildBadges', 'ChildBadgesId', undefined, [{ name: 'childId-index', pk: 'ChildId' }]);
    createTable('Alerts', 'AlertId', undefined, [{ name: 'parentId-createdAt-index', pk: 'ParentId', sk: 'CreatedAt' }, { name: 'childId-createdAt-index', pk: 'ChildId', sk: 'CreatedAt' }]);
    createTable('AuditLogs', 'AuditLogId', undefined, [{ name: 'actorId-createdAt-index', pk: 'ActorId', sk: 'CreatedAt' }]);
    createTable('KYCDocuments', 'KycDocumentId', undefined, [{ name: 'childId-index', pk: 'ChildId' }]);
    createTable('SharedFunds', 'SharedFundId', undefined, [{ name: 'userId-index', pk: 'UserId' }]);
    createTable('Approvals', 'ApprovalId', undefined, [{ name: 'fundId-index', pk: 'FundId' }, { name: 'requestId-index', pk: 'RequestId' }]);

    // ── S3 Bucket (optional avatars) ──
    new s3.Bucket(this, 'SmartWalletAvatars', {
      bucketName: 'smart-wallet-avatars',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      cors: [{ allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT], allowedOrigins: ['*'], allowedHeaders: ['*'] }],
    });

    // ── Outputs ──
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
  }
}

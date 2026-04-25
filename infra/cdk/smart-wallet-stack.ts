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
    createTable('smart-wallet-profiles', 'id', undefined, [{ name: 'role-index', pk: 'role' }]);
    createTable('smart-wallet-child-profiles', 'id', undefined, [{ name: 'parentId-index', pk: 'parentId' }, { name: 'userId-index', pk: 'userId' }]);
    createTable('smart-wallet-parent-child-links', 'id', undefined, [{ name: 'parentId-index', pk: 'parentId' }, { name: 'childId-index', pk: 'childId' }]);
    createTable('smart-wallet-transactions', 'id', undefined, [{ name: 'childId-createdAt-index', pk: 'childId', sk: 'createdAt' }]);
    createTable('smart-wallet-allowance-rules', 'id', undefined, [{ name: 'childId-index', pk: 'childId' }]);
    createTable('smart-wallet-allowance-recommendations', 'id', undefined, [{ name: 'childId-createdAt-index', pk: 'childId', sk: 'createdAt' }, { name: 'status-index', pk: 'status' }]);
    createTable('smart-wallet-extra-allowance-requests', 'id', undefined, [{ name: 'childId-createdAt-index', pk: 'childId', sk: 'createdAt' }, { name: 'parentId-status-index', pk: 'parentId', sk: 'status' }]);
    createTable('smart-wallet-goals', 'id', undefined, [{ name: 'childId-status-index', pk: 'childId', sk: 'status' }]);
    createTable('smart-wallet-badges', 'id');
    createTable('smart-wallet-child-badges', 'id', undefined, [{ name: 'childId-index', pk: 'childId' }]);
    createTable('smart-wallet-alerts', 'id', undefined, [{ name: 'parentId-createdAt-index', pk: 'parentId', sk: 'createdAt' }, { name: 'childId-createdAt-index', pk: 'childId', sk: 'createdAt' }]);
    createTable('smart-wallet-audit-logs', 'id', undefined, [{ name: 'actorId-createdAt-index', pk: 'actorId', sk: 'createdAt' }]);

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

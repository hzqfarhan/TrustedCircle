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
    createTable('smart-wallet-profiles', 'Id', undefined, [{ name: 'RoleIndex', pk: 'Role' }]);
    createTable('smart-wallet-child-profiles', 'Id', undefined, [{ name: 'ParentIdIndex', pk: 'ParentId' }, { name: 'UserIdIndex', pk: 'UserId' }]);
    createTable('smart-wallet-parent-child-links', 'Id', undefined, [{ name: 'ParentIdIndex', pk: 'ParentId' }, { name: 'ChildIdIndex', pk: 'ChildId' }]);
    createTable('smart-wallet-transactions', 'Id', undefined, [{ name: 'ChildIdCreatedAtIndex', pk: 'ChildId', sk: 'CreatedAt' }]);
    createTable('smart-wallet-allowance-rules', 'Id', undefined, [{ name: 'ChildIdIndex', pk: 'ChildId' }]);
    createTable('smart-wallet-allowance-recommendations', 'Id', undefined, [{ name: 'ChildIdCreatedAtIndex', pk: 'ChildId', sk: 'CreatedAt' }, { name: 'StatusIndex', pk: 'Status' }]);
    createTable('smart-wallet-extra-allowance-requests', 'Id', undefined, [{ name: 'ChildIdCreatedAtIndex', pk: 'ChildId', sk: 'CreatedAt' }, { name: 'ParentIdStatusIndex', pk: 'ParentId', sk: 'Status' }]);
    createTable('smart-wallet-goals', 'Id', undefined, [{ name: 'ChildIdStatusIndex', pk: 'ChildId', sk: 'Status' }]);
    createTable('smart-wallet-badges', 'Id');
    createTable('smart-wallet-child-badges', 'Id', undefined, [{ name: 'ChildIdIndex', pk: 'ChildId' }]);
    createTable('smart-wallet-alerts', 'Id', undefined, [{ name: 'ParentIdCreatedAtIndex', pk: 'ParentId', sk: 'CreatedAt' }, { name: 'ChildIdCreatedAtIndex', pk: 'ChildId', sk: 'CreatedAt' }]);
    createTable('smart-wallet-audit-logs', 'Id', undefined, [{ name: 'ActorIdCreatedAtIndex', pk: 'ActorId', sk: 'CreatedAt' }]);

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

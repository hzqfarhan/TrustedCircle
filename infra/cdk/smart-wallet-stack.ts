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
    createTable('JuniorWallet-Profiles', 'id', undefined, [{ name: 'role-index', pk: 'role' }]);
    createTable('JuniorWallet-ChildProfiles', 'id', undefined, [{ name: 'parentId-index', pk: 'parentId' }, { name: 'userId-index', pk: 'userId' }]);
    createTable('JuniorWallet-ParentChildLinks', 'id', undefined, [{ name: 'parentId-index', pk: 'parentId' }, { name: 'childId-index', pk: 'childId' }]);
    createTable('JuniorWallet-Transactions', 'id', undefined, [{ name: 'childId-createdAt-index', pk: 'childId', sk: 'createdAt' }]);
    createTable('JuniorWallet-AllowanceRules', 'id', undefined, [{ name: 'childId-index', pk: 'childId' }]);
    createTable('JuniorWallet-AllowanceRecommendations', 'id', undefined, [{ name: 'childId-createdAt-index', pk: 'childId', sk: 'createdAt' }, { name: 'status-index', pk: 'status' }]);
    createTable('JuniorWallet-ExtraAllowanceRequests', 'id', undefined, [{ name: 'childId-createdAt-index', pk: 'childId', sk: 'createdAt' }, { name: 'parentId-status-index', pk: 'parentId', sk: 'status' }]);
    createTable('JuniorWallet-Goals', 'id', undefined, [{ name: 'childId-status-index', pk: 'childId', sk: 'status' }]);
    createTable('JuniorWallet-Badges', 'id');
    createTable('JuniorWallet-ChildBadges', 'id', undefined, [{ name: 'childId-index', pk: 'childId' }]);
    createTable('JuniorWallet-Alerts', 'id', undefined, [{ name: 'parentId-createdAt-index', pk: 'parentId', sk: 'createdAt' }, { name: 'childId-createdAt-index', pk: 'childId', sk: 'createdAt' }]);
    createTable('JuniorWallet-AuditLogs', 'id', undefined, [{ name: 'actorId-createdAt-index', pk: 'actorId', sk: 'createdAt' }]);
    createTable('JuniorWallet-ChildKycDocuments', 'id', undefined, [{ name: 'childId-index', pk: 'childId' }]);


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

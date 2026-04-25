// ─────────────────────────────────────────────
//  Cognito Client — AWS SDK v3
// ─────────────────────────────────────────────

import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminInitiateAuthCommand,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'ap-southeast-1',
});

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || '';
const CLIENT_ID = process.env.COGNITO_CLIENT_ID || '';

export async function cognitoSignIn(email: string, password: string) {
  const result = await cognitoClient.send(
    new AdminInitiateAuthCommand({
      UserPoolId: USER_POOL_ID,
      ClientId: CLIENT_ID,
      AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    })
  );
  return result.AuthenticationResult;
}

export async function cognitoGetUser(username: string) {
  const result = await cognitoClient.send(
    new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
    })
  );
  return result;
}

export async function cognitoCreateUser(email: string, password: string, attributes: Record<string, string> = {}) {
  // Create user
  await cognitoClient.send(
    new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      TemporaryPassword: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' },
        ...Object.entries(attributes).map(([Name, Value]) => ({ Name, Value })),
      ],
      MessageAction: 'SUPPRESS',
    })
  );

  // Set permanent password
  await cognitoClient.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      Password: password,
      Permanent: true,
    })
  );
}

export { cognitoClient, USER_POOL_ID, CLIENT_ID };


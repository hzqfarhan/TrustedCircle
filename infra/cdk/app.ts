#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SmartWalletStack } from './smart-wallet-stack';

const app = new cdk.App();
new SmartWalletStack(app, 'SmartWalletStack', {
  env: {
    region: process.env.AWS_REGION || 'ap-southeast-1',
  },
});

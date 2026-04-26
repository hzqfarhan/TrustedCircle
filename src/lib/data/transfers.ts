import { assessRisk, type RiskResult } from '@/lib/risk-engine';
import { getRulesByChild } from './rules';
import { getTransactionsByChild, createTransaction } from './transactions';
import { getProfile, updateWalletBalance } from './profiles';
import type { Transaction, TransactionCategory, NeedWant, TransactionType } from '@/types';

interface TransferInput {
  childId: string;
  amount: number;
  recipientId: string;
  merchant?: string;
  category?: TransactionCategory;
  riskScore?: number;
  riskSeverity?: string;
}

export async function validateTransfer(
  childId: string,
  amount: number,
  recipient?: string
): Promise<RiskResult> {
  const rules = await getRulesByChild(childId);
  const recentTransactions = await getTransactionsByChild(childId, 10);

  const avgAmount =
    recentTransactions.length > 0
      ? recentTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0) / recentTransactions.length
      : 0;

  return assessRisk({
    amount,
    senderId: childId,
    recipientId: recipient,
    userAvgAmount: avgAmount,
  });
}

export async function executeTransfer(transfer: TransferInput): Promise<string> {
  const { childId, amount, recipientId, merchant, category, riskScore, riskSeverity } = transfer;

  // Create the transaction record
  const txId = crypto.randomUUID();
  await createTransaction({
    id: txId,
    childId,
    amount,
    merchant: merchant || 'Transfer',
    category: category || 'discretionary' as TransactionCategory,
    classification: category || 'discretionary' as TransactionCategory,
    needWant: 'want' as NeedWant,
    transactionType: 'transfer' as TransactionType,
    riskFlag: false,
    ...(riskScore !== undefined && { riskScore }),
    ...(riskSeverity !== undefined && { riskSeverity }),
    createdAt: new Date().toISOString(),
  });

  // Update sender wallet balance
  const sender = await getProfile(childId);
  if (sender) {
    const newSenderBalance = (sender.walletBalance || 0) - amount;
    await updateWalletBalance(childId, newSenderBalance);
  }

  // Update recipient wallet balance
  const recipient = await getProfile(recipientId);
  if (recipient) {
    const newRecipientBalance = (recipient.walletBalance || 0) + amount;
    await updateWalletBalance(recipientId, newRecipientBalance);
  }

  return txId;
}

export async function getTransferHistory(childId: string, limit = 20): Promise<Transaction[]> {
  return getTransactionsByChild(childId, limit);
}

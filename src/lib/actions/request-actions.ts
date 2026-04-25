'use server';

import { requireCurrentUser } from '@/lib/auth/auth';
import { assertIsChild, assertCanMutateChildData } from '@/lib/auth/authorization';
import { createExtraRequest, resolveExtraRequest, getExtraRequest } from '@/lib/data/requests';
import { getChildProfile, updateChildProfile, getChildProfileByUserId } from '@/lib/data/children';
import { createTransaction } from '@/lib/data/transactions';
import { createAuditLog } from '@/lib/data/audit-logs';
import { createAlert } from '@/lib/data/alerts';
import { getProfile } from '@/lib/data/profiles';
import { v4 as uuid } from 'uuid';
import type { ExtraAllowanceRequest } from '@/types';

export async function submitExtraAllowanceRequest(amount: number, reason: string, childNote: string) {
  const user = await requireCurrentUser();
  const childProfileId = await assertIsChild(user);

  const childProfile = await getChildProfile(childProfileId);
  if (!childProfile) throw new Error('Child profile not found');

  const request: ExtraAllowanceRequest = {
    id: uuid(),
    childId: childProfileId,
    parentId: childProfile.parentId,
    amount,
    reason,
    childNote: childNote || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  await createExtraRequest(request);

  // Alert parent
  await createAlert({
    id: uuid(),
    childId: childProfileId,
    parentId: childProfile.parentId,
    title: 'Extra Allowance Request',
    message: `${childProfile.fullName} requested RM${amount} for: ${reason}`,
    severity: 'info',
    read: false,
    createdAt: new Date().toISOString(),
  });

  return { success: true, requestId: request.id };
}

export async function approveExtraAllowanceRequestAction(requestId: string, approvedAmount: number, parentMessage?: string) {
  const user = await requireCurrentUser();
  const request = await getExtraRequest(requestId);
  if (!request) throw new Error('Request not found');

  await assertCanMutateChildData(user, request.childId);

  const status = approvedAmount >= request.amount ? 'approved' : 'partially_approved';
  await resolveExtraRequest(requestId, status as 'approved' | 'partially_approved', approvedAmount, parentMessage);

  // Update child balance
  const child = await getChildProfile(request.childId);
  if (child) {
    await updateChildProfile(request.childId, {
      currentBalance: child.currentBalance + approvedAmount,
    });

    // Create transaction
    await createTransaction({
      id: uuid(),
      childId: request.childId,
      amount: approvedAmount,
      merchant: 'Extra Allowance',
      category: 'essential',
      classification: 'essential',
      needWant: 'neutral',
      transactionType: 'topup',
      riskFlag: false,
      note: `Extra allowance: ${request.reason}`,
      createdAt: new Date().toISOString(),
    });
  }

  await createAuditLog(user.sub, 'APPROVE_EXTRA_REQUEST', 'extra_request', requestId, undefined, { approvedAmount });

  // Alert child
  await createAlert({
    id: uuid(),
    childId: request.childId,
    parentId: user.sub,
    title: 'Request Approved!',
    message: `Your request for RM${request.amount} was ${status === 'approved' ? 'approved' : `partially approved (RM${approvedAmount})`}.${parentMessage ? ` Note: ${parentMessage}` : ''}`,
    severity: 'success',
    read: false,
    createdAt: new Date().toISOString(),
  });

  return { success: true };
}

export async function rejectExtraAllowanceRequestAction(requestId: string, parentMessage?: string) {
  const user = await requireCurrentUser();
  const request = await getExtraRequest(requestId);
  if (!request) throw new Error('Request not found');

  await assertCanMutateChildData(user, request.childId);

  await resolveExtraRequest(requestId, 'rejected', undefined, parentMessage);
  await createAuditLog(user.sub, 'REJECT_EXTRA_REQUEST', 'extra_request', requestId);

  await createAlert({
    id: uuid(),
    childId: request.childId,
    parentId: user.sub,
    title: 'Request Declined',
    message: `Your request for RM${request.amount} was declined.${parentMessage ? ` Reason: ${parentMessage}` : ''}`,
    severity: 'warning',
    read: false,
    createdAt: new Date().toISOString(),
  });

  return { success: true };
}

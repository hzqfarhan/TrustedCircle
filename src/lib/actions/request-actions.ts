'use server';

import { RequireCurrentUser } from '@/lib/auth/auth';
import { assertIsChild, assertCanMutateChildData } from '@/lib/auth/authorization';
import { CreateExtraRequest, ResolveExtraRequest, GetExtraRequest } from '@/lib/data/requests';
import { GetChildProfile, UpdateChildProfile, GetChildProfileByUserId } from '@/lib/data/children';
import { CreateTransaction } from '@/lib/data/transactions';
import { CreateAuditLog } from '@/lib/data/audit-logs';
import { CreateAlert } from '@/lib/data/alerts';
import { GetProfile } from '@/lib/data/profiles';
import { v4 as uuid } from 'uuid';
import type { ExtraAllowanceRequest } from '@/types';

export async function SubmitExtraAllowanceRequest(amount: number, reason: string, childNote: string) {
  const user = await RequireCurrentUser();
  const childProfileId = await assertIsChild(user);

  const childProfile = await GetChildProfile(childProfileId);
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

  await CreateExtraRequest(request);

  // Alert parent
  await CreateAlert({
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

export async function ApproveExtraAllowanceRequestAction(requestId: string, approvedAmount: number, parentMessage?: string) {
  const user = await RequireCurrentUser();
  const request = await GetExtraRequest(requestId);
  if (!request) throw new Error('Request not found');

  await assertCanMutateChildData(user, request.childId);

  const status = approvedAmount >= request.amount ? 'approved' : 'partially_approved';
  await ResolveExtraRequest(requestId, status as 'approved' | 'partially_approved', approvedAmount, parentMessage);

  // Update child balance
  const child = await GetChildProfile(request.childId);
  if (child) {
    await UpdateChildProfile(request.childId, {
      currentBalance: child.currentBalance + approvedAmount,
    });

    // Create transaction
    await CreateTransaction({
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

  await CreateAuditLog({
    id: uuid(),
    actorId: user.sub,
    action: 'APPROVE_EXTRA_REQUEST',
    entityType: 'extra_request',
    entityId: requestId,
    newValue: { approvedAmount },
    createdAt: new Date().toISOString()
  });

  // Alert child
  await CreateAlert({
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

export async function RejectExtraAllowanceRequestAction(requestId: string, parentMessage?: string) {
  const user = await RequireCurrentUser();
  const request = await GetExtraRequest(requestId);
  if (!request) throw new Error('Request not found');

  await assertCanMutateChildData(user, request.childId);

  await ResolveExtraRequest(requestId, 'rejected', undefined, parentMessage);
  
  await CreateAuditLog({
    id: uuid(),
    actorId: user.sub,
    action: 'REJECT_EXTRA_REQUEST',
    entityType: 'extra_request',
    entityId: requestId,
    createdAt: new Date().toISOString()
  });

  await CreateAlert({
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


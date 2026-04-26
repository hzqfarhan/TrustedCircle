import { putItem, updateItem, queryItems, Tables } from '@/lib/aws/dynamodb';

export interface KycDocument {
  id: string;
  childId: string;
  documentType: string;
  documentUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export async function getKycDocuments(childId: string): Promise<KycDocument[]> {
  return queryItems<KycDocument>(
    Tables.kycDocuments,
    'childId-index',
    'childId = :childId',
    { ':childId': childId }
  );
}

export async function getLatestKycDocument(childId: string): Promise<KycDocument | null> {
  const results = await queryItems<KycDocument>(
    Tables.kycDocuments,
    'childId-index',
    'childId = :childId',
    { ':childId': childId },
    { scanForward: false, limit: 1 }
  );
  return results[0] || null;
}

export async function createKycDocument(doc: Omit<KycDocument, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const id = crypto.randomUUID();
  await putItem(Tables.kycDocuments, {
    ...doc,
    id,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function updateKycStatus(
  id: string,
  status: 'APPROVED' | 'REJECTED'
): Promise<void> {
  await updateItem(Tables.kycDocuments, { id }, {
    status,
    reviewedAt: new Date().toISOString(),
  });
}

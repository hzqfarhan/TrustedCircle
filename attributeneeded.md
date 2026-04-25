# JuniorWallet — Database Attribute Reference

> **Purpose**: Complete attribute map for all database tables used in JuniorWallet. This document bridges front-end and back-end development by defining every field, its type, constraints, and usage context.

---

## Table of Contents

1. [Profiles](#1-profiles)
2. [Child Profiles](#2-child-profiles)
3. [Parent-Child Links](#3-parent-child-links)
4. [Transactions](#4-transactions)
5. [Allowance Rules](#5-allowance-rules)
6. [Allowance Recommendations](#6-allowance-recommendations)
7. [Extra Allowance Requests](#7-extra-allowance-requests)
8. [Goals](#8-goals)
9. [Badges](#9-badges)
10. [Child Badges](#10-child-badges)
11. [Alerts](#11-alerts)
12. [Audit Logs](#12-audit-logs)
13. [KYC Documents](#13-kyc-documents)
14. [Future Tables](#14-future-tables)
15. [Enums & Constants](#15-enums--constants)
16. [DynamoDB Index Reference](#16-dynamodb-index-reference)
17. [Auth & Session](#17-auth--session)

---

## 1. Profiles

**Table**: `JuniorWallet-Profiles`  
**PK**: `id`  
**GSI**: `role-index` (PK: `role`)  
**Purpose**: Core user identity for both parents and children.

| Attribute | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Unique user ID (e.g. `demo_parent`, Cognito `sub`) |
| `fullName` | `string` | ✅ | — | Display name |
| `role` | `string` | ✅ | `"parent"` | `parent` · `child` · `admin` |
| `avatarUrl` | `string` | ❌ | `null` | Path to profile picture (e.g. `/pfp/paan.png`) |
| `phone` | `string` | ❌ | `null` | Phone number (future: OTP verification) |
| `walletBalance` | `number` | ❌ | `0` | Parent's own wallet balance (RM) |
| `createdAt` | `string` (ISO 8601) | ✅ | `now()` | Account creation timestamp |
| `updatedAt` | `string` (ISO 8601) | ✅ | `now()` | Last modification timestamp |

> **Future**: `email`, `phoneVerified`, `emailVerified`, `preferredLanguage`, `notificationPreferences`

---

## 2. Child Profiles

**Table**: `JuniorWallet-ChildProfiles`  
**PK**: `id`  
**GSIs**: `parentId-index` (PK: `parentId`), `userId-index` (PK: `userId`)  
**Purpose**: Extended profile for child accounts with financial and KYC data.

| Attribute | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Child profile ID (e.g. `cp_aiman`, `child_ibad_demo`) |
| `userId` | `string` | ✅ | — | FK → `profiles.id` for the child's user account |
| `parentId` | `string` | ✅ | — | FK → `profiles.id` for the linked parent |
| `fullName` | `string` | ✅ | — | Child's full legal name |
| `nickname` | `string` | ❌ | — | Short display name |
| `email` | `string` | ❌ | — | Child email (used instead of phone for under-12) |
| `dateOfBirth` | `string` (YYYY-MM-DD) | ❌ | — | Date of birth |
| `ageGroup` | `string` | ✅ | — | `under_7` · `under_12` · `teen` (computed from DOB) |
| `relationship` | `string` | ❌ | — | `father` · `mother` · `guardian` · `other` |
| `responsibilityScore` | `number` | ✅ | `100` | 0–100 behavioral score |
| `currentBalance` | `number` | ✅ | `0` | Available spending balance (RM) |
| `monthlyAllowance` | `number` | ✅ | `0` | Approved monthly allowance (RM) |
| `kycStatus` | `string` | ❌ | `"kyc_pending"` | `kyc_pending` · `kyc_under_review` · `verified` · `rejected` |
| `status` | `string` | ✅ | `"pending_kyc"` | `active` · `inactive` · `pending_kyc` · `removed` · `suspended` |
| `createdAt` | `string` (ISO 8601) | ✅ | `now()` | — |
| `updatedAt` | `string` (ISO 8601) | ✅ | `now()` | — |

> **Future**: `spendingLimit`, `limitType`, `avatarUrl`, `schoolName`, `grade`, `emergencyContact`

---

## 3. Parent-Child Links

**Table**: `JuniorWallet-ParentChildLinks`  
**PK**: `id`  
**GSIs**: `parentId-index` (PK: `parentId`), `childId-index` (PK: `childId`)  
**Purpose**: Many-to-many link between parents and child profiles.

| Attribute | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Link ID |
| `parentId` | `string` | ✅ | — | FK → `profiles.id` |
| `childId` | `string` | ✅ | — | FK → `child-profiles.id` |
| `relationship` | `string` | ✅ | — | `father` · `mother` · `guardian` · `other` |
| `createdAt` | `string` (ISO 8601) | ✅ | `now()` | — |

> **Future**: `permissionLevel`, `isActive`, `approvedBySecondParent`

---

## 4. Transactions

**Table**: `JuniorWallet-Transactions`  
**PK**: `id`  
**GSI**: `childId-createdAt-index` (PK: `childId`, SK: `createdAt`)  
**Purpose**: All financial movements (spending, top-ups, savings, transfers).

| Attribute | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Transaction ID |
| `childId` | `string` | ✅ | — | FK → `child-profiles.id` |
| `amount` | `number` | ✅ | — | Transaction amount (RM) |
| `merchant` | `string` | ✅ | — | Merchant / source name |
| `category` | `string` | ✅ | — | `essential` · `educational` · `savings` · `discretionary` · `risky` |
| `classification` | `string` | ✅ | — | Same enum as category (AI-classified) |
| `needWant` | `string` | ✅ | — | `need` · `want` · `neutral` |
| `transactionType` | `string` | ✅ | — | `spend` · `topup` · `transfer` · `saving` |
| `riskFlag` | `boolean` | ✅ | `false` | Whether AI flagged this as risky |
| `note` | `string` | ❌ | — | Optional description |
| `createdAt` | `string` (ISO 8601) | ✅ | `now()` | — |

> **Future**: `status` (PENDING/BLOCKED/COMPLETED), `locationLat`, `locationLng`, `merchantCategory`, `receiptImageKey`, `approvedBy`, `blockedReason`

---

## 5. Allowance Rules

**Table**: `JuniorWallet-AllowanceRules`  
**PK**: `id`  
**GSI**: `childId-index` (PK: `childId`)  
**Purpose**: Parent-set spending limits per category.

| Attribute | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Rule ID |
| `childId` | `string` | ✅ | — | FK → `child-profiles.id` |
| `category` | `string` | ✅ | — | Spending category to limit |
| `limitType` | `string` | ✅ | — | `daily` · `weekly` · `monthly` |
| `amount` | `number` | ✅ | — | Max spend amount (RM) |
| `isActive` | `boolean` | ✅ | `true` | Whether rule is enforced |
| `createdBy` | `string` | ✅ | — | FK → `profiles.id` (parent who set it) |
| `createdAt` | `string` (ISO 8601) | ✅ | `now()` | — |
| `updatedAt` | `string` (ISO 8601) | ✅ | `now()` | — |

> **Future**: `notifyOnBreach`, `autoBlockOnExceed`, `cooldownPeriodMinutes`

---

## 6. Allowance Recommendations

**Table**: `JuniorWallet-AllowanceRecommendations`  
**PK**: `id`  
**GSIs**: `childId-createdAt-index` (PK: `childId`, SK: `createdAt`), `status-index` (PK: `status`)  
**Purpose**: AI-generated monthly allowance suggestions.

| Attribute | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Recommendation ID |
| `childId` | `string` | ✅ | — | FK → `child-profiles.id` |
| `suggestedAmount` | `number` | ✅ | — | Total recommended allowance (RM) |
| `basicNeeds` | `number` | ✅ | — | Breakdown: food & transport |
| `schoolAdjustment` | `number` | ✅ | — | Breakdown: school-related |
| `flexibleBuffer` | `number` | ✅ | — | Breakdown: discretionary buffer |
| `savingsGoal` | `number` | ✅ | — | Breakdown: savings component |
| `overspendingPenalty` | `number` | ✅ | `0` | Deduction for irresponsible spending |
| `responsibilityScore` | `number` | ✅ | — | Score snapshot at recommendation time |
| `predictedSpending` | `object` | ✅ | — | `{ essential, educational, discretionary, savings }` |
| `riskFlags` | `array` | ✅ | `[]` | `[{ category, message, severity }]` |
| `explanation` | `string` | ✅ | — | AI-generated explanation text |
| `status` | `string` | ✅ | `"pending"` | `pending` · `approved` · `rejected` · `edited` |
| `approvedAmount` | `number` | ❌ | — | Parent-approved amount (if different) |
| `approvedBy` | `string` | ❌ | — | FK → `profiles.id` |
| `aiProvider` | `string` | ❌ | `"local"` | `local` · `alibaba-pai` · `hybrid` |
| `explanationProvider` | `string` | ❌ | `"local"` | Same enum as `aiProvider` |
| `createdAt` | `string` (ISO 8601) | ✅ | `now()` | — |
| `resolvedAt` | `string` (ISO 8601) | ❌ | — | When parent acted on it |

---

## 7. Extra Allowance Requests

**Table**: `JuniorWallet-ExtraAllowanceRequests`  
**PK**: `id`  
**GSIs**: `childId-createdAt-index` (PK: `childId`, SK: `createdAt`), `parentId-status-index` (PK: `parentId`, SK: `status`)  
**Purpose**: Child-initiated requests for additional money.

| Attribute | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Request ID |
| `childId` | `string` | ✅ | — | FK → `child-profiles.id` |
| `parentId` | `string` | ✅ | — | FK → `profiles.id` |
| `amount` | `number` | ✅ | — | Requested amount (RM) |
| `reason` | `string` | ✅ | — | Why they need it |
| `childNote` | `string` | ✅ | `""` | Optional child message |
| `status` | `string` | ✅ | `"pending"` | `pending` · `approved` · `rejected` · `partially_approved` |
| `approvedAmount` | `number` | ❌ | — | Actual approved amount |
| `parentMessage` | `string` | ❌ | — | Parent's response note |
| `createdAt` | `string` (ISO 8601) | ✅ | `now()` | — |
| `resolvedAt` | `string` (ISO 8601) | ❌ | — | When parent resolved it |

---

## 8. Goals

**Table**: `JuniorWallet-Goals`  
**PK**: `id`  
**GSI**: `childId-status-index` (PK: `childId`, SK: `status`)  
**Purpose**: Child savings goals.

| Attribute | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Goal ID |
| `childId` | `string` | ✅ | — | FK → `child-profiles.id` |
| `title` | `string` | ✅ | — | Goal name |
| `goalType` | `string` | ✅ | — | `education` · `emergency` · `toy` · `event` · `custom` |
| `targetAmount` | `number` | ✅ | — | Target savings (RM) |
| `currentAmount` | `number` | ✅ | `0` | Current progress (RM) |
| `status` | `string` | ✅ | `"active"` | `active` · `completed` · `cancelled` |
| `createdAt` | `string` (ISO 8601) | ✅ | `now()` | — |
| `completedAt` | `string` (ISO 8601) | ❌ | — | Auto-set when `currentAmount >= targetAmount` |

> **Future**: `imageUrl`, `deadline`, `parentApproved`, `rewardBadgeId`

---

## 9. Badges

**Table**: `JuniorWallet-Badges`  
**PK**: `id`  
**Purpose**: Badge definitions (gamification).

| Attribute | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Badge ID |
| `name` | `string` | ✅ | — | Badge name (e.g. "Smart Saver") |
| `description` | `string` | ✅ | — | How to earn it |
| `icon` | `string` | ✅ | — | Emoji or icon key |
| `requirementKey` | `string` | ✅ | — | Logic key: `savings_streak_4`, `within_limits`, `needs_ratio`, `goal_funded` |
| `createdAt` | `string` (ISO 8601) | ✅ | `now()` | — |

> **Future**: `tier` (bronze/silver/gold), `xpReward`, `isSecret`, `category`

---

## 10. Child Badges

**Table**: `JuniorWallet-ChildBadges`  
**PK**: `id`  
**GSI**: `childId-index` (PK: `childId`)  
**Purpose**: Which badges a child has earned.

| Attribute | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Record ID |
| `childId` | `string` | ✅ | — | FK → `child-profiles.id` |
| `badgeId` | `string` | ✅ | — | FK → `badges.id` |
| `unlockedAt` | `string` (ISO 8601) | ✅ | — | When the badge was earned |

---

## 11. Alerts

**Table**: `JuniorWallet-Alerts`  
**PK**: `id`  
**GSIs**: `parentId-createdAt-index` (PK: `parentId`, SK: `createdAt`), `childId-createdAt-index` (PK: `childId`, SK: `createdAt`)  
**Purpose**: In-app notifications for parents and children.

| Attribute | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Alert ID |
| `childId` | `string` | ✅ | — | FK → `child-profiles.id` |
| `parentId` | `string` | ✅ | — | FK → `profiles.id` |
| `title` | `string` | ✅ | — | Alert title |
| `message` | `string` | ✅ | — | Alert body text |
| `severity` | `string` | ✅ | `"info"` | `info` · `warning` · `critical` · `success` |
| `read` | `boolean` | ✅ | `false` | Whether user has seen it |
| `createdAt` | `string` (ISO 8601) | ✅ | `now()` | — |

> **Future**: `readAt`, `actionUrl`, `actionLabel`, `expiresAt`, `category`, `voiceNarration`

---

## 12. Audit Logs

**Table**: `JuniorWallet-AuditLogs`  
**PK**: `id`  
**GSI**: `actorId-createdAt-index` (PK: `actorId`, SK: `createdAt`)  
**Purpose**: Immutable record of all system actions for compliance.

| Attribute | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Log ID |
| `actorId` | `string` | ✅ | — | Who performed the action (FK → `profiles.id`) |
| `action` | `string` | ✅ | — | Action key (see Actions enum below) |
| `entityType` | `string` | ✅ | — | `child_profile` · `extra_request` · `recommendation` · `transaction` |
| `entityId` | `string` | ✅ | — | ID of the affected entity |
| `oldValue` | `object` | ❌ | — | Previous state (JSON) |
| `newValue` | `object` | ❌ | — | New state (JSON) |
| `createdAt` | `string` (ISO 8601) | ✅ | `now()` | — |

**Known Action Keys**: `child_created`, `child_updated`, `child_removed`, `APPROVE_EXTRA_REQUEST`, `REJECT_EXTRA_REQUEST`, `money_packet_blocked_for_child`, `child_transfer_blocked`, `child_transfer_validated`

---

## 13. KYC Documents

**Table**: `JuniorWallet-ChildKycDocuments`  
**PK**: `id`  
**Purpose**: Identity verification documents for child accounts.

| Attribute | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `string` | ✅ | — | Document record ID |
| `childId` | `string` | ✅ | — | FK → `child-profiles.id` |
| `parentId` | `string` | ✅ | — | FK → `profiles.id` (who submitted it) |
| `documentType` | `string` | ✅ | — | `mykid` · `birth_certificate` |
| `documentNumberMasked` | `string` | ✅ | — | Masked display (e.g. `******-**-0031` or `FILE_UPLOADED`) |
| `documentNumberHash` | `string` | ✅ | — | SHA-256 hash for lookup |
| `documentFileKey` | `string` | ✅ | — | S3 key or uploaded filename |
| `status` | `string` | ✅ | `"pending"` | `pending` · `approved` · `rejected` |
| `submittedAt` | `string` (ISO 8601) | ✅ | `now()` | — |
| `createdAt` | `string` (ISO 8601) | ✅ | `now()` | — |
| `updatedAt` | `string` (ISO 8601) | ✅ | `now()` | — |

> **Future**: `reviewedBy`, `reviewedAt`, `rejectionReason`, `expiresAt`, `ocrExtractedData`

---

## 14. Future Tables

### 14.1 Spending Controls (Zone Rules)

> Currently lives in Prisma schema (`ZoneRule` model). Needs DynamoDB equivalent.

| Attribute | Type | Description |
|---|---|---|
| `id` | `string` | Zone rule ID |
| `childProfileId` | `string` | FK → `child-profiles.id` |
| `name` | `string` | Zone name (e.g. "School Area") |
| `isActive` | `boolean` | Whether zone is enforced |
| `latitude` | `number` | Center latitude |
| `longitude` | `number` | Center longitude |
| `radiusMeters` | `number` | Geofence radius |
| `allowedCategories` | `string[]` | Categories allowed in this zone |
| `createdAt` | `string` | — |

### 14.2 Recurring Allowance Schedules

| Attribute | Type | Description |
|---|---|---|
| `id` | `string` | Schedule ID |
| `childId` | `string` | FK → `child-profiles.id` |
| `parentId` | `string` | FK → `profiles.id` |
| `amount` | `number` | Recurring amount (RM) |
| `frequency` | `string` | `daily` · `weekly` · `biweekly` · `monthly` |
| `dayOfWeek` | `number` | 0–6 (for weekly) |
| `dayOfMonth` | `number` | 1–31 (for monthly) |
| `isActive` | `boolean` | — |
| `nextPayoutAt` | `string` | Next scheduled payout |
| `lastPaidAt` | `string` | Last executed payout |
| `createdAt` | `string` | — |

### 14.3 Merchant Whitelist / Blacklist

| Attribute | Type | Description |
|---|---|---|
| `id` | `string` | Entry ID |
| `childId` | `string` | FK → `child-profiles.id` |
| `merchantName` | `string` | Merchant identifier |
| `listType` | `string` | `whitelist` · `blacklist` |
| `reason` | `string` | Why it was added |
| `addedBy` | `string` | FK → `profiles.id` |
| `createdAt` | `string` | — |

### 14.4 Notifications / Push Tokens

| Attribute | Type | Description |
|---|---|---|
| `id` | `string` | Token ID |
| `userId` | `string` | FK → `profiles.id` |
| `token` | `string` | FCM / APNs push token |
| `platform` | `string` | `ios` · `android` · `web` |
| `isActive` | `boolean` | — |
| `createdAt` | `string` | — |

### 14.5 Risk Assessments (DynamoDB version)

> Currently in Prisma schema. Needs DynamoDB equivalent.

| Attribute | Type | Description |
|---|---|---|
| `id` | `string` | Assessment ID |
| `transactionId` | `string` | FK → `transactions.id` |
| `score` | `number` | 0–100 risk score |
| `severity` | `string` | `low` · `medium` · `high` · `critical` |
| `reasons` | `string[]` | Array of risk reason strings |
| `actions` | `string[]` | Recommended actions |
| `aiProvider` | `string` | Which AI engine assessed it |
| `createdAt` | `string` | — |

---

## 15. Enums & Constants

### Roles
```
parent · child · admin
```

### Transaction Categories
```
essential · educational · savings · discretionary · risky
```

### Need/Want Classification
```
need · want · neutral
```

### Transaction Types
```
spend · topup · transfer · saving
```

### KYC Status
```
kyc_pending · kyc_under_review · verified · rejected
```

### Child Account Status
```
active · inactive · pending_kyc · removed · suspended
```

### Recommendation Status
```
pending · approved · rejected · edited
```

### Extra Request Status
```
pending · approved · rejected · partially_approved
```

### Alert Severity
```
info · warning · critical · success
```

### AI Provider
```
local · alibaba-pai · hybrid
```

### Allowed Child Transfer Types (Whitelist)
```
parent_allowance_transfer · parent_topup · approved_extra_allowance · approved_school_request · refund_from_approved_merchant
```

### Blocked Transfer Types
```
money_packet · open_transfer · peer_to_peer · campaign_payout_without_parent_approval · unlinked_sender_transfer · child_to_child_transfer
```

### Document Types
```
mykid · birth_certificate
```

### Relationship Types
```
father · mother · guardian · other
```

### Age Groups
```
under_7 · under_12 · teen
```

### Goal Types
```
education · emergency · toy · event · custom
```

### Allowance Limit Types
```
daily · weekly · monthly
```

---

## 16. DynamoDB Index Reference

| Table | GSI Name | Partition Key | Sort Key |
|---|---|---|---|
| `JuniorWallet-Profiles` | `role-index` | `role` | — |
| `JuniorWallet-ChildProfiles` | `parentId-index` | `parentId` | — |
| `JuniorWallet-ChildProfiles` | `userId-index` | `userId` | — |
| `JuniorWallet-ParentChildLinks` | `parentId-index` | `parentId` | — |
| `JuniorWallet-ParentChildLinks` | `childId-index` | `childId` | — |
| `JuniorWallet-Transactions` | `childId-createdAt-index` | `childId` | `createdAt` |
| `JuniorWallet-AllowanceRules` | `childId-index` | `childId` | — |
| `JuniorWallet-AllowanceRecommendations` | `childId-createdAt-index` | `childId` | `createdAt` |
| `JuniorWallet-AllowanceRecommendations` | `status-index` | `status` | — |
| `JuniorWallet-ExtraAllowanceRequests` | `childId-createdAt-index` | `childId` | `createdAt` |
| `JuniorWallet-ExtraAllowanceRequests` | `parentId-status-index` | `parentId` | `status` |
| `JuniorWallet-Goals` | `childId-status-index` | `childId` | `status` |
| `JuniorWallet-ChildBadges` | `childId-index` | `childId` | — |
| `JuniorWallet-Alerts` | `parentId-createdAt-index` | `parentId` | `createdAt` |
| `JuniorWallet-Alerts` | `childId-createdAt-index` | `childId` | `createdAt` |
| `JuniorWallet-AuditLogs` | `actorId-createdAt-index` | `actorId` | `createdAt` |

---

## 17. Auth & Session

### Cognito User (JWT payload)

| Field | Type | Description |
|---|---|---|
| `sub` | `string` | Cognito user ID (maps to `profiles.id`) |
| `email` | `string` | User's email |
| `custom:role` | `string` | User role from Cognito custom attribute |

### Demo Mode Cookies

| Cookie | Purpose |
|---|---|
| `demo_user_id` | Overrides auth to use a specific profile ID |
| `auth_token` | Cognito JWT (production mode) |

### AuthUser (Server-side shape)

```typescript
interface AuthUser {
  sub: string;    // profiles.id
  email: string;
  role?: string;  // parent · child · admin
}
```

---

## Relationship Diagram

```
profiles (parent)
  │
  ├── 1:N ── parent-child-links ── N:1 ── child-profiles
  │                                           │
  │                                           ├── 1:N ── transactions
  │                                           ├── 1:N ── allowance-rules
  │                                           ├── 1:N ── allowance-recommendations
  │                                           ├── 1:N ── extra-allowance-requests
  │                                           ├── 1:N ── goals
  │                                           ├── 1:N ── child-badges ── N:1 ── badges
  │                                           └── 1:N ── kyc-documents
  │
  ├── 1:N ── alerts (as parentId)
  └── 1:N ── audit-logs (as actorId)
```

---

*Last updated: 2026-04-25*

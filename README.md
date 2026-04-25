# JuniorWallet (formerly GoCircle / Trusted Circle Wallet)

JuniorWallet is an AI-powered Smart Allowance System inspired by Touch ’n Go eWallet. It helps parents guide child spending, allowance decisions, savings behavior, and financial responsibility through secure AWS-backed transactions and Alibaba Cloud-powered AI analytics.

## Core Principle: "AI Recommends. Parent Decides."
The system's AI evaluates a child's spending behavior (needs vs. wants, rule adherence, savings consistency) and generates an allowance recommendation. However, **the AI never automatically transfers money**. A parent must always review and approve the recommendation. The engine is deterministically designed so that it never rewards reckless spending.

## Child KYC & Family Linking
JuniorWallet includes a comprehensive and secure family management system:
- **Parent Management:** Parents can add and manage multiple children.
- **Child Email Access:** Children under 12 use email instead of a required phone number for account access.
- **KYC Verification:** Parents must upload a valid MyKid or Birth Certificate to link a child account.
- **Secure Document Handling:** Documents are stored in private S3 buckets (or safe local/mock adapters for development).
- **KYC Statuses:** Child accounts move through `Draft`, `Pending Review`, `Verified`, or `Needs Resubmission` states.
- **Safe Editing:** Parents can safely edit child nicknames without altering the locked legal names.
- **Child Removals:** Parents can securely soft-delete/remove children while preserving audit history.
- **Protected Transfers:** Child accounts can strictly only receive money from their linked parent or guardian. Unlinked transfers, open peer-to-peer transfers, and Money Packets (Ang Pao) are strictly blocked to protect children.
- **Privacy & Masking:** MyKid / NRIC numbers are dynamically masked in the UI (`******-**-0031`) and are strictly forbidden from being stored in raw format within audit logs.
- **Mock Demo Data:** The system seeds a realistic mock child profile (`ibad`) with mock KYC records and blocked-transfer test cases.

## Multi-Cloud Architecture
This application utilizes a multi-cloud design:
- **AWS (Backend & Data Layer):** Next.js App Router, DynamoDB, Cognito Authentication, S3, IAM, and transactional workflows.
- **Alibaba Cloud (AI & Analytics):** PAI (Platform for AI) and Qwen (Model Studio) for natural language insights and advanced behavior scoring.
- **Local Fallback:** If Alibaba Cloud credentials are not configured, the app gracefully falls back to the Local MVP Engine, which runs a deterministic evaluation of spending behavior.

*Note: Alibaba provider adapters are credential-ready. The Local AI fallback powers the MVP when Alibaba credentials are not configured.*

## Privacy & Anonymization
Before any behavioral data is synced to Alibaba Cloud for analytics, the system strips all personally identifiable information (PII). Child IDs are anonymized (`anon_uuid`), and transaction data is aggregated to maintain family privacy.

## Tech Stack
- Next.js 14+ App Router
- TypeScript & Tailwind CSS v4
- AWS SDK v3 (DynamoDB, Cognito, S3)
- Lucide React & Recharts
- Zustand / React Context

## Setup & Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and fill in your AWS credentials. 
   *(Optional)* Fill in your Alibaba Cloud credentials to enable the Hybrid/PAI engine.
   ```bash
   cp .env.example .env
   ```

3. **Deploy Infrastructure:**
   Ensure AWS CDK is installed, then deploy the DynamoDB tables and Cognito User Pool.
   ```bash
   cd infra/cdk
   npm install
   npx cdk deploy
   ```

4. **Seed Demo Data:**
   Run the seeding script to populate your tables with GoCircle demo data.
   ```bash
   npx tsx scripts/seed-demo-data.ts
   ```

5. **Start Dev Server:**
   ```bash
   npm run dev
   ```

## Demo Accounts
When running locally with the demo login buttons, you can easily test the UI flows without needing Cognito credentials:
- **Demo Parent:** Paan
- **Demo Child:** Aiman
- **Demo Child (KYC):** ibad

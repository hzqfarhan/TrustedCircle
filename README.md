# Trusted Circle — #JanjiTrusted

> A mobile-first Malaysian e-wallet feature prototype built for hackathon.  
> Built with Next.js 15, Prisma + SQLite, Tailwind CSS, shadcn/ui, Recharts, Framer Motion, and Web Speech API.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Push the database schema
```bash
npx prisma db push
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Seed demo data
```bash
npx tsx prisma/seed.ts
```

### 5. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 Demo Users

Switch users using the **Role Switcher** dropdown in the top bar.

| Name | Role | Description |
|------|------|-------------|
| **Akmal** | Parent | Full control — can monitor child, approve withdrawals, verify transfers |
| **Paan** | Companion | Co-manager — can approve withdrawals, verify transfers |
| **Wafi** | Friend | Member — can contribute and request withdrawal |
| **Ibad** | General | View and contribute only |
| **Abangku** | Friend | Member — can contribute and request |
| **Child Demo** | Child | Restricted wallet, monitored by Akmal |

---

## 🎯 Demo Scenarios

### Demo 1: Shared Fund Withdrawal Approval
1. Switch to **Akmal** (Parent)
2. Go to **Trusted Circle → Shared Funds** → open **Bali Trip 2026**
3. Tap **Request Withdrawal**, enter RM 500, submit
4. Switch to **Paan** (Companion) → **Shared Funds → Bali Trip 2026**
5. Tap **Approve** on the pending withdrawal
6. Switch to **Wafi** (Friend) → Approve again
7. Withdrawal auto-completes (2 of 3 rule satisfied)

### Demo 2: Child Zone Violation
1. Switch to **Akmal** (Parent)
2. Go to **Trusted Circle → Child Account**
3. Tap **Manage Zones**, scroll down, tap **Simulate Zone Violation**
4. Switch to **Alerts** — parent receives high-severity zone alert
5. The child's blocked transaction appears in their transaction history

### Demo 3: High-Risk Transfer with AI
1. Go to **Transfer**
2. Enter: Recipient = `Scammer`, Account ID = `SCAMMER_123`, Amount = `2500`
3. Tap **Review Transfer** — AI detects HIGH risk (score 100)
4. See risk explanation cards and tap **Play Voice Warning** to hear the narration
5. Tap **Proceed with Verification** → enter any 6 digits → transfer completes

### Demo 4: AI Monitor Scenarios
1. Go to **Trusted Circle → AI Monitor**
2. Tap any scenario card to see the explainable risk output
3. Tap **Play Voice Warning** on a HIGH risk scenario

---

## 📱 All Routes

| Route | Description |
|-------|-------------|
| `/dashboard` | Wallet balance, quick actions, Trusted Circle preview |
| `/transfer` | Multi-step transfer with AI risk analysis |
| `/trusted-circle` | Feature hub |
| `/trusted-circle/funds` | List of shared funds |
| `/trusted-circle/funds/new` | Create new fund |
| `/trusted-circle/funds/[id]` | Fund detail + approvals |
| `/trusted-circle/funds/[id]/withdraw` | Request withdrawal |
| `/trusted-circle/child` | Child account parent/child view |
| `/trusted-circle/child/create` | Link child account |
| `/trusted-circle/child/[id]/cashflow` | Weekly/monthly cashflow charts |
| `/trusted-circle/child/[id]/controls` | Spending limits + zone rules |
| `/trusted-circle/ai-monitor` | AI risk engine demo |
| `/trusted-circle/alerts` | Risk and notification alerts |
| `/trusted-circle/members` | Circle members + wallet balances |
| `/trusted-circle/roles` | Role permission matrix |
| `/settings` | Voice, large text, transfer threshold |

---

## 🧠 Risk Engine Logic

| Signal | Score |
|--------|-------|
| Amount 3×–5× above average | +15–25 |
| Exceeds RM1000 threshold | +20 |
| New recipient | +15 |
| CCID-flagged account | +35 |
| Midnight–5am transaction | +10 |
| Child outside allowed zone | +40 |
| Repeated failed attempts | +15 |
| Unusual category spike | +15 |

**Severity thresholds:**
- **0–24** → LOW 🟢
- **25–59** → MEDIUM 🟡  
- **60+** → HIGH 🔴

---

## 🗂 Project Structure

```
src/
├── app/
│   ├── api/                  # API Routes
│   │   ├── dashboard/
│   │   ├── funds/[id]/
│   │   ├── child/
│   │   ├── transfer/
│   │   ├── approvals/[id]/
│   │   └── alerts/
│   ├── dashboard/
│   ├── transfer/
│   ├── trusted-circle/
│   │   ├── funds/
│   │   ├── child/
│   │   ├── ai-monitor/
│   │   ├── alerts/
│   │   ├── members/
│   │   └── roles/
│   └── settings/
├── components/
│   ├── ui/                   # shadcn/ui
│   ├── MobileShell.tsx
│   ├── BottomNav.tsx
│   ├── WalletHeader.tsx
│   ├── WalletBalanceCard.tsx
│   ├── QuickActions.tsx
│   ├── TrustedCircleCard.tsx
│   ├── SharedFundCard.tsx
│   ├── ApprovalTracker.tsx
│   ├── MemberAvatarGroup.tsx
│   ├── AlertBanner.tsx
│   ├── TransactionList.tsx
│   ├── VoiceAssistButton.tsx
│   └── RoleSwitcher.tsx
├── lib/
│   ├── db.ts                 # Prisma singleton
│   ├── risk-engine.ts        # AI risk scoring
│   ├── voice.ts              # Web Speech API
│   ├── auth-context.tsx      # Mock auth context
│   └── utils-tc.ts           # Helpers
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

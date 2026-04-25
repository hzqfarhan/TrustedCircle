export const mockTransactions = [
  {
    id: "txn_1",
    title: "Top Up to ibad",
    amount: 165,
    type: "money_in",
    status: "Completed",
    date: "Today, 10:30 AM",
    category: "Allowance",
  },
  {
    id: "txn_2",
    title: "Pay Bills",
    amount: -45,
    type: "money_out",
    status: "Completed",
    date: "Yesterday, 8:15 PM",
    category: "Bills",
  },
  {
    id: "txn_3",
    title: "Transfer to ibad",
    amount: 30,
    type: "money_in",
    status: "Completed",
    date: "12 Apr, 3:20 PM",
    category: "Transfer",
  },
  {
    id: "txn_4",
    title: "School Supplies",
    amount: -18,
    type: "money_out",
    status: "Completed",
    date: "10 Apr, 11:05 AM",
    category: "Education",
  },
];

export const mockTopUpAmounts = [10, 30, 50, 100];

export const mockBillCategories = [
  "School Fees",
  "Tuition",
  "Mobile Prepaid",
  "Utilities",
];

export const mockCard = {
  holder: "ibad",
  status: "Active",
  dailyLimit: 20,
  monthlyLimit: 165,
};

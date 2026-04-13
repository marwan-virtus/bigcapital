/**
 * Format camelCase subject to readable text (e.g., SaleInvoice -> Sale Invoice)
 */
export function formatSubject(subject: string): string {
  const specialCases: Record<string, string> = {
    SaleInvoice: 'Sale Invoice',
    SaleEstimate: 'Sale Estimate',
    SaleReceipt: 'Sale Receipt',
    PaymentReceive: 'Payment Received',
    PaymentMade: 'Payment Made',
    CreditNote: 'Credit Note',
    VendorCredit: 'Vendor Credit',
    ManualJournal: 'Manual Journal',
    InventoryAdjustment: 'Inventory Adjustment',
    WarehouseTransfer: 'Warehouse Transfer',
    ItemCategory: 'Item Category',
    BankRule: 'Bank Rule',
    TransactionsLocking: 'Transactions Locking',
    CreditNoteRefund: 'Credit Note Refund',
    VendorCreditRefund: 'Vendor Credit Refund',
    Cashflow: 'Cashflow',
    TaxRate: 'Tax Rate',
    UncategorizedTransaction: 'Uncategorized Transaction',
    PlaidTransactions: 'Plaid Transactions',
    BankTransaction: 'Bank Transaction',
  };

  if (specialCases[subject]) {
    return specialCases[subject];
  }

  return subject
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Format action to capitalized text (e.g., created -> Created)
 */
export function formatAction(action: string): string {
  if (!action) return '';
  return action
    .replace(/_/g, ' ')
    .replace(/^./, (str) => str.toUpperCase());
}

/**
 * Format metadata into a human-readable summary based on subject type.
 */
export function formatMetadataSummary(
  metadata: Record<string, unknown> | null,
  subject: string,
): string {
  if (metadata == null) return '';

  const formatters: Record<
    string,
    (m: Record<string, unknown>) => string
  > = {
    Bill: (m) => {
      if (m.billNumber) {
        return m.amount
          ? `Bill ${m.billNumber} - ${m.amount} ${m.currencyCode || ''}`
          : `Bill ${m.billNumber}`;
      }
      return String(m.billNumber || '');
    },
    SaleInvoice: (m) => {
      if (m.invoiceNumber) {
        return m.balance
          ? `Invoice ${m.invoiceNumber} - Balance: ${m.balance} ${m.currencyCode || ''}`
          : `Invoice ${m.invoiceNumber}`;
      }
      return String(m.invoiceNumber || '');
    },
    SaleReceipt: (m) => {
      if (m.receiptNumber) {
        return m.amount
          ? `Receipt ${m.receiptNumber} - ${m.amount} ${m.currencyCode || ''}`
          : `Receipt ${m.receiptNumber}`;
      }
      return String(m.receiptNumber || '');
    },
    SaleEstimate: (m) => {
      if (m.estimateNumber) {
        return m.total
          ? `Estimate ${m.estimateNumber} - ${m.total} ${m.currencyCode || ''}`
          : `Estimate ${m.estimateNumber}`;
      }
      return String(m.estimateNumber || '');
    },
    PaymentReceive: (m) => {
      if (m.paymentReceiveNo) {
        return m.amount
          ? `Payment ${m.paymentReceiveNo} - ${m.amount} ${m.currencyCode || ''}`
          : `Payment ${m.paymentReceiveNo}`;
      }
      return String(m.paymentReceiveNo || '');
    },
    PaymentMade: (m) => {
      if (m.paymentNumber) {
        return m.amount
          ? `Payment ${m.paymentNumber} - ${m.amount} ${m.currencyCode || ''}`
          : `Payment ${m.paymentNumber}`;
      }
      return String(m.paymentNumber || '');
    },
    Expense: (m) => {
      if (m.amount) {
        return m.currencyCode
          ? `Expense - ${m.amount} ${m.currencyCode}`
          : `Expense - ${m.amount}`;
      }
      return 'Expense';
    },
    CreditNote: (m) => {
      if (m.creditNoteNumber) {
        return m.amount
          ? `Credit Note ${m.creditNoteNumber} - ${m.amount} ${m.currencyCode || ''}`
          : `Credit Note ${m.creditNoteNumber}`;
      }
      return String(m.creditNoteNumber || '');
    },
    VendorCredit: (m) => {
      if (m.vendorCreditNumber) {
        return m.total
          ? `Vendor Credit ${m.vendorCreditNumber} - ${m.total} ${m.currencyCode || ''}`
          : `Vendor Credit ${m.vendorCreditNumber}`;
      }
      return String(m.vendorCreditNumber || '');
    },
    ManualJournal: (m) => {
      if (m.journalNumber) {
        return m.amount
          ? `Journal ${m.journalNumber} - ${m.amount} ${m.currencyCode || ''}`
          : `Journal ${m.journalNumber}`;
      }
      return String(m.journalNumber || '');
    },
    Cashflow: (m) => {
      if (m.amount) {
        return m.currencyCode
          ? `Cashflow - ${m.amount} ${m.currencyCode}`
          : `Cashflow - ${m.amount}`;
      }
      return 'Cashflow';
    },
    Account: (m) => {
      if (m.name) {
        return m.code ? `Account: ${m.name} (${m.code})` : `Account: ${m.name}`;
      }
      return 'Account';
    },
    InventoryAdjustment: (m) => {
      return m.reason
        ? `Adjustment: ${m.reason}`
        : 'Inventory Adjustment';
    },
    WarehouseTransfer: (m) => {
      if (m.transactionNumber) {
        return `Transfer: ${m.transactionNumber}`;
      }
      return 'Warehouse Transfer';
    },
    Item: (m) => {
      if (m.name) {
        return m.code ? `${m.name} (${m.code})` : String(m.name);
      }
      return 'Item';
    },
    Customer: (m) => {
      if (m.displayName) {
        return m.email
          ? `${m.displayName} (${m.email})`
          : String(m.displayName);
      }
      return 'Customer';
    },
    Vendor: (m) => {
      if (m.displayName) {
        return m.email
          ? `${m.displayName} (${m.email})`
          : String(m.displayName);
      }
      return 'Vendor';
    },
    Role: (m) => {
      if (m.roleName) {
        return m.oldRoleName
          ? `Role: ${m.roleName} (was: ${m.oldRoleName})`
          : `Role: ${m.roleName}`;
      }
      return 'Role';
    },
    TaxRate: (m) => {
      if (m.name) {
        return m.rate !== undefined ? `${m.name} - ${m.rate}%` : String(m.name);
      }
      return 'Tax Rate';
    },
    Warehouse: (m) => {
      return m.code ? `Warehouse: ${m.code}` : 'Warehouse';
    },
    Branch: (m) => {
      if (m.name) {
        return m.code ? `${m.name} (${m.code})` : String(m.name);
      }
      return 'Branch';
    },
    ItemCategory: (m) => {
      return m.name ? `Category: ${m.name}` : 'Item Category';
    },
    BankRule: (m) => {
      return m.name ? `Rule: ${m.name}` : 'Bank Rule';
    },
    TransactionsLocking: (m) => {
      if (m.module) {
        return m.lockToDate
          ? `Module: ${m.module} locked to ${m.lockToDate}`
          : `Module: ${m.module}`;
      }
      return 'Transactions Locking';
    },
    CreditNoteRefund: (m) => {
      if (m.amount) {
        return `Refund - ${m.amount}`;
      }
      return 'Credit Note Refund';
    },
    VendorCreditRefund: (m) => {
      if (m.amount) {
        return `Refund - ${m.amount}`;
      }
      return 'Vendor Credit Refund';
    },
    UncategorizedTransaction: (m) => {
      if (m.amount) {
        return m.payee
          ? `Imported - ${m.payee}: ${m.amount} ${m.currencyCode || ''}`
          : `Imported - ${m.amount} ${m.currencyCode || ''}`;
      }
      return 'Imported Transaction';
    },
    PlaidTransactions: (m) => {
      if (m.plaidAccountId) {
        return m.batch
          ? `Plaid Sync - Account ${m.plaidAccountId} (Batch: ${m.batch})`
          : `Plaid Sync - Account ${m.plaidAccountId}`;
      }
      return 'Plaid Sync';
    },
    BankTransaction: (m) => {
      if (m.amount) {
        return m.payee
          ? `${m.payee}: ${m.amount} ${m.currencyCode || ''}`
          : `${m.amount} ${m.currencyCode || ''}`;
      }
      return 'Bank Transaction';
    },
  };

  const formatter = formatters[subject];
  if (formatter) {
    try {
      return formatter(metadata);
    } catch (e) {
      // Fallback to default below
    }
  }

  const entries = Object.entries(metadata).filter(
    ([, value]) => value !== null && value !== undefined && value !== '',
  );

  if (entries.length === 0) return '';

  return entries
    .slice(0, 3)
    .map(([key, value]) => {
      const displayKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      return `${displayKey}: ${value}`;
    })
    .join(', ');
}

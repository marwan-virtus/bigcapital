import { ILedger } from '@/modules/Ledger/types/Ledger.types';
import { ModelObject } from 'objection';
import { Account } from '@/modules/Accounts/models/Account.model';
import { IBalanceSheetQuery } from './BalanceSheet.types';

/**
 * Balance sheet repository interface.
 * Both MySQL and ClickHouse implementations must conform to this interface.
 */
export interface IBalanceSheetRepository {
  // Query
  query: any;

  // Accounts
  accounts: ModelObject<Account>[];
  accountsGraph: any;
  accountsByType: Map<string, ModelObject<Account>[]>;
  accountsByParentType: Map<string, ModelObject<Account>[]>;

  // Total closing ledger
  totalAccountsLedger: ILedger;

  // Income / Expense ledgers
  incomeLedger: ILedger;
  expensesLedger: ILedger;

  // Date periods
  periodsAccountsLedger: ILedger;
  periodsOpeningAccountLedger: ILedger;

  // Previous Year (PY)
  PYTotalAccountsLedger: ILedger;
  PYPeriodsAccountsLedger: ILedger;
  PYPeriodsOpeningAccountLedger: ILedger;

  // Previous Period (PP)
  PPTotalAccountsLedger: ILedger;
  PPPeriodsAccountsLedger: ILedger;
  PPPeriodsOpeningAccountLedger: ILedger;

  // Net Income - Date Periods
  incomePeriodsAccountsLedger: ILedger;
  incomePeriodsOpeningAccountsLedger: ILedger;
  expensesPeriodsAccountsLedger: ILedger;
  expensesOpeningAccountLedger: ILedger;

  // Net Income - Previous Period
  incomePPAccountsLedger: ILedger;
  expensePPAccountsLedger: ILedger;
  incomePPPeriodsAccountsLedger: ILedger;
  incomePPPeriodsOpeningAccountLedger: ILedger;
  expensePPPeriodsAccountsLedger: ILedger;
  expensePPPeriodsOpeningAccountLedger: ILedger;

  // Net Income - Previous Year
  incomePYTotalAccountsLedger: ILedger;
  expensePYTotalAccountsLedger: ILedger;
  incomePYPeriodsAccountsLedger: ILedger;
  incomePYPeriodsOpeningAccountLedger: ILedger;
  expensePYPeriodsAccountsLedger: ILedger;
  expensePYPeriodsOpeningAccountLedger: ILedger;

  // Income / Expense account lists
  incomeAccounts: ModelObject<Account>[];
  incomeAccountsIds: number[];
  expenseAccounts: ModelObject<Account>[];
  expenseAccountsIds: number[];

  // Transactions group type
  transactionsGroupType: string;

  /**
   * Async initialize the repository with the given query.
   */
  asyncInitialize(query: IBalanceSheetQuery): Promise<void>;
}

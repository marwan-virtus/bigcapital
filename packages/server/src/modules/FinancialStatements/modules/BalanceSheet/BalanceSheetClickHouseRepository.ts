// @ts-nocheck
import { Inject, Injectable, Scope } from '@nestjs/common';
import * as R from 'ramda';
import { isEmpty } from 'lodash';
import { ModelObject } from 'objection';
import { IBalanceSheetQuery, IAccountTransactionsGroupBy } from './BalanceSheet.types';
import { BalanceSheetQuery } from './BalanceSheetQuery';
import { ILedger } from '@/modules/Ledger/types/Ledger.types';
import { Ledger } from '@/modules/Ledger/Ledger';
import { transformToMapBy } from '@/utils/transform-to-map-by';
import { Account } from '@/modules/Accounts/models/Account.model';
import { TenantModelProxy } from '@/modules/System/models/TenantBaseModel';
import { ClickHouseService } from '@/modules/ClickHouse/ClickHouse.service';
import { ACCOUNT_PARENT_TYPE } from '@/constants/accounts';
import { IBalanceSheetRepository } from './IBalanceSheetRepository';

/**
 * Maps ClickHouse query result row to a ledger-compatible transaction object.
 */
interface CHTransactionRow {
  account_id: number;
  credit: string | number;
  debit: string | number;
  date?: string;
  account_normal?: string;
  account_type?: string;
  account_parent_type?: string;
}

@Injectable({ scope: Scope.TRANSIENT })
export class BalanceSheetClickHouseRepository implements IBalanceSheetRepository {
  @Inject(Account.name)
  public readonly accountModel: TenantModelProxy<typeof Account>;

  @Inject(ClickHouseService)
  private readonly clickHouse: ClickHouseService;

  public query: BalanceSheetQuery;
  public accounts: ModelObject<Account>[] = [];
  public accountsGraph: any;
  public accountsByType: Map<string, ModelObject<Account>[]> = new Map();
  public accountsByParentType: Map<string, ModelObject<Account>[]> = new Map();

  public totalAccountsLedger: ILedger;
  public incomeLedger: ILedger;
  public expensesLedger: ILedger;

  public periodsAccountsLedger: ILedger;
  public periodsOpeningAccountLedger: ILedger;

  public PYTotalAccountsLedger: ILedger;
  public PYPeriodsAccountsLedger: ILedger;
  public PYPeriodsOpeningAccountLedger: ILedger;

  public PPTotalAccountsLedger: ILedger;
  public PPPeriodsAccountsLedger: ILedger;
  public PPPeriodsOpeningAccountLedger: ILedger;

  public incomePeriodsAccountsLedger: ILedger;
  public incomePeriodsOpeningAccountsLedger: ILedger;
  public expensesPeriodsAccountsLedger: ILedger;
  public expensesOpeningAccountLedger: ILedger;

  public incomePPAccountsLedger: ILedger;
  public expensePPAccountsLedger: ILedger;
  public incomePPPeriodsAccountsLedger: ILedger;
  public incomePPPeriodsOpeningAccountLedger: ILedger;
  public expensePPPeriodsAccountsLedger: ILedger;
  public expensePPPeriodsOpeningAccountLedger: ILedger;

  public incomePYTotalAccountsLedger: ILedger;
  public expensePYTotalAccountsLedger: ILedger;
  public incomePYPeriodsAccountsLedger: ILedger;
  public incomePYPeriodsOpeningAccountLedger: ILedger;
  public expensePYPeriodsAccountsLedger: ILedger;
  public expensePYPeriodsOpeningAccountLedger: ILedger;

  public transactionsGroupType: IAccountTransactionsGroupBy = IAccountTransactionsGroupBy.Month;

  // Internal account normal map built from MySQL accounts
  private accountNormalMap: Map<number, string> = new Map();

  public setQuery(query: IBalanceSheetQuery) {
    this.query = new BalanceSheetQuery(query);
    this.transactionsGroupType = this.getGroupByFromDisplayColumnsBy(
      this.query.displayColumnsBy,
    );
  }

  public asyncInitialize = async (query: IBalanceSheetQuery) => {
    this.setQuery(query);

    await this.initAccounts();
    await this.initAccountsGraph();
    await this.initAccountsTotalLedger();

    if (this.query.isDatePeriodsColumnsType()) {
      await this.initTotalDatePeriods();
    }
    if (this.query.isPreviousYearActive()) {
      await this.initTotalPreviousYear();
    }
    if (
      this.query.isPreviousYearActive() &&
      this.query.isDatePeriodsColumnsType()
    ) {
      await this.initPeriodsPreviousYear();
    }
    if (this.query.isPreviousPeriodActive()) {
      await this.initTotalPreviousPeriod();
    }
    if (
      this.query.isPreviousPeriodActive() &&
      this.query.isDatePeriodsColumnsType()
    ) {
      await this.initPeriodsPreviousPeriod();
    }

    await this.asyncInitializeNetIncome();
  };

  // ----------------------------
  // # Accounts
  // ----------------------------
  public initAccounts = async () => {
    const accounts = await this.getAccounts();
    this.accounts = accounts;
    this.accountsByType = transformToMapBy(accounts, 'accountType');
    this.accountsByParentType = transformToMapBy(accounts, 'accountParentType');

    // Build account normal map for ledger entries
    accounts.forEach((acc) => {
      this.accountNormalMap.set(acc.id, acc.accountNormal);
    });
  };

  public initAccountsGraph = async () => {
    this.accountsGraph = this.accountModel().toDependencyGraph(this.accounts);
  };

  public getAccounts = () => {
    return this.accountModel().query();
  };

  // ----------------------------
  // # Closing Total
  // ----------------------------
  public initAccountsTotalLedger = async (): Promise<void> => {
    const totalByAccount = await this.closingAccountsTotal(this.query.toDate);
    this.totalAccountsLedger = Ledger.fromTransactions(totalByAccount);
  };

  // ----------------------------
  // # Date periods.
  // ----------------------------
  public initTotalDatePeriods = async (): Promise<void> => {
    const [periodsByAccount, periodsOpeningByAccount] = await Promise.all([
      this.accountsDatePeriods(
        this.query.fromDate,
        this.query.toDate,
        this.transactionsGroupType,
      ),
      this.closingAccountsTotal(this.query.fromDate),
    ]);
    this.periodsAccountsLedger = Ledger.fromTransactions(periodsByAccount);
    this.periodsOpeningAccountLedger = Ledger.fromTransactions(periodsOpeningByAccount);
  };

  // ----------------------------
  // # Previous Year (PY).
  // ----------------------------
  public initTotalPreviousYear = async (): Promise<void> => {
    const PYTotalsByAccounts = await this.closingAccountsTotal(this.query.PYToDate);
    this.PYTotalAccountsLedger = Ledger.fromTransactions(PYTotalsByAccounts);
  };

  public initPeriodsPreviousYear = async (): Promise<void> => {
    const [PYPeriodsBYAccounts, periodsOpeningByAccount] = await Promise.all([
      this.accountsDatePeriods(
        this.query.PYFromDate,
        this.query.PYToDate,
        this.transactionsGroupType,
      ),
      this.closingAccountsTotal(this.query.PYFromDate),
    ]);
    this.PYPeriodsAccountsLedger = Ledger.fromTransactions(PYPeriodsBYAccounts);
    this.PYPeriodsOpeningAccountLedger = Ledger.fromTransactions(periodsOpeningByAccount);
  };

  // ----------------------------
  // # Previous Year (PP).
  // ----------------------------
  public initTotalPreviousPeriod = async (): Promise<void> => {
    const PPTotalsByAccounts = await this.closingAccountsTotal(this.query.PPToDate);
    this.PPTotalAccountsLedger = Ledger.fromTransactions(PPTotalsByAccounts);
  };

  public initPeriodsPreviousPeriod = async (): Promise<void> => {
    const [PPPeriodsBYAccounts, periodsOpeningByAccount] = await Promise.all([
      this.accountsDatePeriods(
        this.query.PPFromDate,
        this.query.PPToDate,
        this.transactionsGroupType,
      ),
      this.closingAccountsTotal(this.query.PPFromDate),
    ]);
    this.PPPeriodsAccountsLedger = Ledger.fromTransactions(PPPeriodsBYAccounts);
    this.PPPeriodsOpeningAccountLedger = Ledger.fromTransactions(periodsOpeningByAccount);
  };

  // ----------------------------
  // # ClickHouse Queries
  // ----------------------------

  /**
   * Retrieve closing accounts total up to a date from ClickHouse.
   */
  public closingAccountsTotal = async (toDate: Date | string) => {
    const dateStr = this.formatDate(toDate);
    const branchFilter = this.buildBranchFilter();

    const query = `
      SELECT
        account_id,
        sum(credit) AS credit,
        sum(debit) AS debit
      FROM accounts_transactions
      WHERE date <= {toDate:Date}
        ${branchFilter}
      GROUP BY account_id
    `;

    const rows = await this.clickHouse.query<CHTransactionRow>(query, { toDate: dateStr });
    return this.mapToLedgerTransactions(rows);
  };

  /**
   * Retrieve account transactions grouped by date periods from ClickHouse.
   */
  public accountsDatePeriods = async (
    fromDate: Date,
    toDate: Date,
    datePeriodsType: string,
  ) => {
    const fromStr = this.formatDate(fromDate);
    const toStr = this.formatDate(toDate);
    const groupFormat = this.getClickHouseDateFormat(datePeriodsType);
    const branchFilter = this.buildBranchFilter();

    const query = `
      SELECT
        account_id,
        formatDateTime(date, '${groupFormat}') AS date,
        sum(credit) AS credit,
        sum(debit) AS debit
      FROM accounts_transactions
      WHERE date >= {fromDate:Date}
        AND date <= {toDate:Date}
        ${branchFilter}
      GROUP BY account_id, formatDateTime(date, '${groupFormat}')
      ORDER BY account_id, date
    `;

    const rows = await this.clickHouse.query<CHTransactionRow>(query, {
      fromDate: fromStr,
      toDate: toStr,
    });
    return this.mapToLedgerTransactions(rows);
  };

  // ----------------------------
  // # Net Income (mirrored from BalanceSheetRepositoryNetIncome)
  // ----------------------------
  public asyncInitializeNetIncome = async () => {
    this.initIncomeAccounts();
    this.initExpenseAccounts();
    this.initIncomeTotalLedger();
    this.initExpensesTotalLedger();

    if (this.query.isDatePeriodsColumnsType()) {
      this.initNetIncomeDatePeriods();
    }
    if (this.query.isPreviousYearActive()) {
      this.initNetIncomePreviousYear();
    }
    if (this.query.isPreviousPeriodActive()) {
      this.initNetIncomePreviousPeriod();
    }
    if (
      this.query.isPreviousYearActive() &&
      this.query.isDatePeriodsColumnsType()
    ) {
      this.initNetIncomePeriodsPreviewYear();
    }
    if (
      this.query.isPreviousPeriodActive() &&
      this.query.isDatePeriodsColumnsType()
    ) {
      this.initNetIncomePeriodsPreviousPeriod();
    }
  };

  public incomeAccounts: ModelObject<Account>[] = [];
  public incomeAccountsIds: number[] = [];
  public expenseAccounts: ModelObject<Account>[] = [];
  public expenseAccountsIds: number[] = [];

  public initIncomeAccounts = () => {
    const incomeAccounts = this.accountsByParentType.get(ACCOUNT_PARENT_TYPE.INCOME) || [];
    const incomeAccountsIds = incomeAccounts.map((a) => a.id);
    this.incomeAccounts = incomeAccounts;
    this.incomeAccountsIds = incomeAccountsIds;
  };

  public initExpenseAccounts = () => {
    const expenseAccounts = this.accountsByParentType.get(ACCOUNT_PARENT_TYPE.EXPENSE) || [];
    const expenseAccountsIds = expenseAccounts.map((a) => a.id);
    this.expenseAccounts = expenseAccounts;
    this.expenseAccountsIds = expenseAccountsIds;
  };

  public initIncomeTotalLedger = (): void => {
    const incomeAccounts = this.accountsByParentType.get(ACCOUNT_PARENT_TYPE.INCOME) || [];
    const incomeAccountsIds = incomeAccounts.map((a) => a.id);
    this.incomeLedger = this.totalAccountsLedger.whereAccountsIds(incomeAccountsIds);
  };

  public initExpensesTotalLedger = (): void => {
    const expenseAccounts = this.accountsByParentType.get(ACCOUNT_PARENT_TYPE.EXPENSE) || [];
    const expenseAccountsIds = expenseAccounts.map((a) => a.id);
    this.expensesLedger = this.totalAccountsLedger.whereAccountsIds(expenseAccountsIds);
  };

  public initNetIncomeDatePeriods = () => {
    const incomeAccounts = this.accountsByParentType.get(ACCOUNT_PARENT_TYPE.INCOME) || [];
    const incomeAccountsIds = incomeAccounts.map((a) => a.id);
    const expenseAccounts = this.accountsByParentType.get(ACCOUNT_PARENT_TYPE.EXPENSE) || [];
    const expenseAccountsIds = expenseAccounts.map((a) => a.id);

    this.incomePeriodsAccountsLedger = this.periodsAccountsLedger.whereAccountsIds(incomeAccountsIds);
    this.incomePeriodsOpeningAccountsLedger = this.periodsOpeningAccountLedger.whereAccountsIds(incomeAccountsIds);
    this.expensesPeriodsAccountsLedger = this.periodsAccountsLedger.whereAccountsIds(expenseAccountsIds);
    this.expensesOpeningAccountLedger = this.periodsOpeningAccountLedger.whereAccountsIds(expenseAccountsIds);
  };

  public initNetIncomePreviousPeriod = () => {
    const incomeAccounts = this.accountsByParentType.get(ACCOUNT_PARENT_TYPE.INCOME) || [];
    const incomeAccountsIds = incomeAccounts.map((a) => a.id);
    const expenseAccounts = this.accountsByParentType.get(ACCOUNT_PARENT_TYPE.EXPENSE) || [];
    const expenseAccountsIds = expenseAccounts.map((a) => a.id);

    this.incomePPAccountsLedger = this.PPTotalAccountsLedger.whereAccountsIds(incomeAccountsIds);
    this.expensePPAccountsLedger = this.PPTotalAccountsLedger.whereAccountsIds(expenseAccountsIds);
  };

  public initNetIncomePeriodsPreviousPeriod = () => {
    const incomeAccounts = this.accountsByParentType.get(ACCOUNT_PARENT_TYPE.INCOME) || [];
    const incomeAccountsIds = incomeAccounts.map((a) => a.id);
    const expenseAccounts = this.accountsByParentType.get(ACCOUNT_PARENT_TYPE.EXPENSE) || [];
    const expenseAccountsIds = expenseAccounts.map((a) => a.id);

    this.incomePPPeriodsAccountsLedger = this.PPPeriodsAccountsLedger.whereAccountsIds(incomeAccountsIds);
    this.incomePPPeriodsOpeningAccountLedger = this.PPPeriodsOpeningAccountLedger.whereAccountsIds(incomeAccountsIds);
    this.expensePPPeriodsAccountsLedger = this.PPPeriodsAccountsLedger.whereAccountsIds(expenseAccountsIds);
    this.expensePPPeriodsOpeningAccountLedger = this.PPPeriodsOpeningAccountLedger.whereAccountsIds(expenseAccountsIds);
  };

  public initNetIncomePreviousYear = () => {
    const incomeAccounts = this.accountsByParentType.get(ACCOUNT_PARENT_TYPE.INCOME) || [];
    const incomeAccountsIds = incomeAccounts.map((a) => a.id);
    const expenseAccounts = this.accountsByParentType.get(ACCOUNT_PARENT_TYPE.EXPENSE) || [];
    const expenseAccountsIds = expenseAccounts.map((a) => a.id);

    this.incomePYTotalAccountsLedger = this.PYTotalAccountsLedger.whereAccountsIds(incomeAccountsIds);
    this.expensePYTotalAccountsLedger = this.PYTotalAccountsLedger.whereAccountsIds(expenseAccountsIds);
  };

  public initNetIncomePeriodsPreviewYear = () => {
    const incomeAccounts = this.accountsByParentType.get(ACCOUNT_PARENT_TYPE.INCOME) || [];
    const incomeAccountsIds = incomeAccounts.map((a) => a.id);
    const expenseAccounts = this.accountsByParentType.get(ACCOUNT_PARENT_TYPE.EXPENSE) || [];
    const expenseAccountsIds = expenseAccounts.map((a) => a.id);

    this.incomePYPeriodsAccountsLedger = this.PYPeriodsAccountsLedger.whereAccountsIds(incomeAccountsIds);
    this.incomePYPeriodsOpeningAccountLedger = this.PYPeriodsOpeningAccountLedger.whereAccountsIds(incomeAccountsIds);
    this.expensePYPeriodsAccountsLedger = this.PYPeriodsAccountsLedger.whereAccountsIds(expenseAccountsIds);
    this.expensePYPeriodsOpeningAccountLedger = this.PYPeriodsOpeningAccountLedger.whereAccountsIds(expenseAccountsIds);
  };

  // ----------------------------
  // # Helpers
  // ----------------------------

  private mapToLedgerTransactions(rows: CHTransactionRow[]): any[] {
    return rows.map((row) => ({
      accountId: row.account_id,
      credit: Number(row.credit) || 0,
      debit: Number(row.debit) || 0,
      date: row.date,
      account: {
        accountNormal: this.accountNormalMap.get(row.account_id) || 'debit',
      },
    }));
  }

  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  private getClickHouseDateFormat(groupType: string): string {
    const formats: Record<string, string> = {
      day: '%Y-%m-%d',
      month: '%Y-%m',
      year: '%Y',
    };
    return formats[groupType] || '%Y-%m';
  }

  private buildBranchFilter(): string {
    if (!isEmpty(this.query?.branchesIds)) {
      const ids = this.query.branchesIds.map((id: number) => String(id)).join(',');
      return `AND branch_id IN (${ids})`;
    }
    return '';
  }

  private getGroupByFromDisplayColumnsBy(columnsBy: string): IAccountTransactionsGroupBy {
    const mapping: Record<string, IAccountTransactionsGroupBy> = {
      week: IAccountTransactionsGroupBy.Day,
      quarter: IAccountTransactionsGroupBy.Month,
      year: IAccountTransactionsGroupBy.Year,
      month: IAccountTransactionsGroupBy.Month,
      day: IAccountTransactionsGroupBy.Day,
    };
    return mapping[columnsBy] || IAccountTransactionsGroupBy.Month;
  }
}

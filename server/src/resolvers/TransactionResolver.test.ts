import "reflect-metadata";

process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";

// Mock typeorm
jest.mock("typeorm", () => ({
  getConnection: jest.fn(),
  Entity: () => () => {},
  PrimaryGeneratedColumn: () => () => {},
  Column: () => () => {},
  BaseEntity: class {},
  ManyToOne: () => () => {},
  OneToMany: () => () => {},
}));

// Mock type-graphql decorators
jest.mock("type-graphql", () => ({
  Resolver: () => () => {},
  Query: () => () => {},
  Mutation: () => () => {},
  Arg: () => () => {},
  Field: () => () => {},
  ObjectType: () => () => {},
  Ctx: () => () => {},
  UseMiddleware: () => () => {},
  Int: "Int",
  Float: "Float",
}));

// Mock middleware
jest.mock("../middleware", () => ({
  isAuth: (_target: any, _key: string, _descriptor: PropertyDescriptor) => {},
}));

// Mock faker
jest.mock("faker", () => ({
  default: {
    finance: {
      transactionType: jest.fn().mockReturnValue("deposit"),
      amount: jest.fn().mockReturnValue("100"),
    },
    date: {
      recent: jest.fn().mockReturnValue(new Date("2023-01-15")),
    },
  },
  __esModule: true,
}));

// Mock entities
jest.mock("../entity/User", () => ({
  User: {
    findOne: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../entity/Account", () => ({
  Account: {
    find: jest.fn(),
    findOne: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../entity/Transaction", () => ({
  Transaction: {
    find: jest.fn(),
    findOne: jest.fn(),
    insert: jest.fn(),
  },
}));

import { TransactionResolver } from "./TransactionResolver";
import { User } from "../entity/User";
import { Account } from "../entity/Account";
import { Transaction } from "../entity/Transaction";
import faker from "faker";

const mockUser = {
  id: 1,
  email: "test@example.com",
  password: "hashedpassword123",
  firstName: "John",
  lastName: "Doe",
  dateOfBirth: "1990-01-01",
  streetAddress: "123 Main St",
  postCode: "12345",
  city: "TestCity",
  country: "TestCountry",
  tokenVersion: 0,
};

const mockAccount = {
  id: 1,
  owner: mockUser,
  currency: "EUR",
  balance: 1000,
  sortCode: "12-34-56",
  iban: "GB12 AP0L 1234 5678 9012 34",
  bic: "AP0LGB12",
};

const mockTransactions = [
  {
    id: 1,
    account: mockAccount,
    transactionType: "deposit",
    date: new Date("2023-01-15"),
    amount: "100",
  },
  {
    id: 2,
    account: mockAccount,
    transactionType: "withdrawal",
    date: new Date("2023-01-16"),
    amount: "50",
  },
];

describe("TransactionResolver", () => {
  let resolver: TransactionResolver;

  beforeEach(() => {
    resolver = new TransactionResolver();
    jest.clearAllMocks();
  });

  describe("transactions", () => {
    it("returns null when no payload", async () => {
      const ctx = { payload: undefined } as any;
      const result = await resolver.transactions("EUR", ctx);
      expect(result).toBeNull();
    });

    it("returns transactions for account", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Account.findOne as jest.Mock).mockResolvedValue(mockAccount);
      (Transaction.find as jest.Mock).mockResolvedValue(mockTransactions);
      const ctx = { payload: { userId: 1 } } as any;

      const result = await resolver.transactions("EUR", ctx);
      expect(result).toEqual(mockTransactions);
      expect(Transaction.find).toHaveBeenCalledWith({
        where: { account: mockAccount },
      });
    });
  });

  describe("createTransaction", () => {
    it("returns false when no payload", async () => {
      const ctx = { payload: undefined } as any;
      const result = await resolver.createTransaction("EUR", ctx);
      expect(result).toBe(false);
    });

    it("throws when balance<=0", async () => {
      const zeroBalanceAccount = { ...mockAccount, balance: 0 };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Account.findOne as jest.Mock).mockResolvedValue(zeroBalanceAccount);
      const ctx = { payload: { userId: 1 } } as any;

      await expect(
        resolver.createTransaction("EUR", ctx)
      ).rejects.toThrow("You do not have the sufficient funds.");
    });

    it("creates transaction and updates balance for deposit", async () => {
      (faker.finance.transactionType as jest.Mock).mockReturnValue("deposit");
      (faker.finance.amount as jest.Mock).mockReturnValue("100");
      (faker.date.recent as jest.Mock).mockReturnValue(new Date("2023-01-15"));

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Account.findOne as jest.Mock)
        .mockResolvedValueOnce(mockAccount) // first call in the method body
        .mockResolvedValueOnce({ ...mockAccount, balance: 1100 }); // updatedAccount at the end
      (Transaction.insert as jest.Mock).mockResolvedValue({});
      (Account.update as jest.Mock).mockResolvedValue({});
      const ctx = { payload: { userId: 1 } } as any;

      const result = await resolver.createTransaction("EUR", ctx);
      expect(Transaction.insert).toHaveBeenCalled();
      expect(Account.update).toHaveBeenCalledWith(
        { id: mockAccount.id },
        { balance: 1100 } // 1000 + 100 deposit
      );
      expect(result).toBe(1100);
    });

    it("creates transaction and updates balance for withdrawal", async () => {
      (faker.finance.transactionType as jest.Mock).mockReturnValue("withdrawal");
      (faker.finance.amount as jest.Mock).mockReturnValue("200");
      (faker.date.recent as jest.Mock).mockReturnValue(new Date("2023-01-15"));

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Account.findOne as jest.Mock)
        .mockResolvedValueOnce(mockAccount) // account with balance 1000
        .mockResolvedValueOnce({ ...mockAccount, balance: 800 }); // updatedAccount
      (Transaction.insert as jest.Mock).mockResolvedValue({});
      (Account.update as jest.Mock).mockResolvedValue({});
      const ctx = { payload: { userId: 1 } } as any;

      const result = await resolver.createTransaction("EUR", ctx);
      expect(Account.update).toHaveBeenCalledWith(
        { id: mockAccount.id },
        { balance: 800 } // 1000 - 200 withdrawal
      );
      expect(result).toBe(800);
    });
  });
});

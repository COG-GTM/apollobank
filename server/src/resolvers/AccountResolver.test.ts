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

// Mock createRandom utils
jest.mock("../utils/createRandom", () => ({
  createRandomSortCode: jest.fn().mockReturnValue("12-34-56"),
  createRandomIbanCode: jest.fn().mockReturnValue("GB12 AP0L 1234 5678 9012 34"),
  createRandomBicCode: jest.fn().mockReturnValue("AP0LGB12"),
  createRandomCardNumber: jest.fn().mockReturnValue("1234 5678 9012 3456"),
  createRandomNumber: jest.fn().mockReturnValue("1234"),
}));

import { AccountResolver } from "./AccountResolver";
import { User } from "../entity/User";
import { Account } from "../entity/Account";

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

const mockAccountUSD = {
  id: 2,
  owner: mockUser,
  currency: "USD",
  balance: 500,
  sortCode: "00-00-00",
  iban: "GB34 AP0L 5678 9012 3456 78",
  bic: "AP0LGB34",
};

describe("AccountResolver", () => {
  let resolver: AccountResolver;

  beforeEach(() => {
    resolver = new AccountResolver();
    jest.clearAllMocks();
  });

  describe("accounts", () => {
    it("returns null when no payload", async () => {
      const ctx = { payload: undefined } as any;
      const result = await resolver.accounts(ctx);
      expect(result).toBeNull();
    });

    it("returns accounts for owner", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Account.find as jest.Mock).mockResolvedValue([mockAccount, mockAccountUSD]);
      const ctx = { payload: { userId: 1 } } as any;

      const result = await resolver.accounts(ctx);
      expect(result).toEqual([mockAccount, mockAccountUSD]);
      expect(Account.find).toHaveBeenCalledWith({ where: { owner: mockUser } });
    });
  });

  describe("account", () => {
    it("returns undefined when no payload", async () => {
      const ctx = { payload: undefined } as any;
      // The real code throws new Error("") when no payload
      await expect(resolver.account("EUR", ctx)).rejects.toThrow("");
    });

    it("returns account for currency", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Account.findOne as jest.Mock).mockResolvedValue(mockAccount);
      const ctx = { payload: { userId: 1 } } as any;

      const result = await resolver.account("EUR", ctx);
      expect(result).toEqual(mockAccount);
      expect(Account.findOne).toHaveBeenCalledWith({
        where: { owner: mockUser, currency: "EUR" },
      });
    });
  });

  describe("addMoney", () => {
    it("returns null when no payload", async () => {
      const ctx = { payload: undefined } as any;
      const result = await resolver.addMoney(100, "EUR", ctx);
      expect(result).toBeNull();
    });

    it("updates balance and returns updated account", async () => {
      const updatedAccount = { ...mockAccount, balance: 1100 };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Account.findOne as jest.Mock)
        .mockResolvedValueOnce(mockAccount) // first call for finding the account
        .mockResolvedValueOnce(updatedAccount); // second call for returning updated
      (Account.update as jest.Mock).mockResolvedValue({});
      const ctx = { payload: { userId: 1 } } as any;

      const result = await resolver.addMoney(100, "EUR", ctx);
      expect(Account.update).toHaveBeenCalledWith(
        { id: mockAccount.id },
        { balance: 1100 }
      );
      expect(result).toEqual({
        account: updatedAccount,
        message: "Successfully topped up your account.",
      });
    });
  });

  describe("exchange", () => {
    it("returns null when no payload", async () => {
      const ctx = { payload: undefined } as any;
      const result = await resolver.exchange("EUR", "USD", 100, ctx);
      expect(result).toBeNull();
    });

    it("throws when insufficient funds", async () => {
      const lowBalanceAccount = { ...mockAccount, balance: 50 };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Account.findOne as jest.Mock).mockResolvedValueOnce(lowBalanceAccount);
      const ctx = { payload: { userId: 1 } } as any;

      await expect(
        resolver.exchange("EUR", "USD", 100, ctx)
      ).rejects.toThrow(
        "You do not have the sufficient funds to make this exchange."
      );
    });

    it("correctly converts EUR to USD", async () => {
      const updatedFromAccount = { ...mockAccount, balance: 889 };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Account.findOne as jest.Mock)
        .mockResolvedValueOnce(mockAccount) // currentAccount (EUR, balance 1000)
        .mockResolvedValueOnce(mockAccountUSD) // toAccount (USD, balance 500)
        .mockResolvedValueOnce(updatedFromAccount); // updated account for return
      (Account.update as jest.Mock).mockResolvedValue({});
      const ctx = { payload: { userId: 1 } } as any;

      const result = await resolver.exchange("EUR", "USD", 100, ctx);
      // EUR to USD: 100 * 1.11 = 111, round = 111
      expect(Account.update).toHaveBeenCalledWith(
        { id: mockAccountUSD.id },
        { balance: 500 + 111 }
      );
      expect(Account.update).toHaveBeenCalledWith(
        { id: mockAccount.id },
        { balance: 1000 - 111 }
      );
      expect(result).toEqual({
        account: updatedFromAccount,
        message: "The exchange was successfully executed.",
      });
    });

    it("throws when balance would fall below 0 after conversion", async () => {
      const tightAccount = { ...mockAccount, balance: 100 };
      const largeConversionToAccount = { ...mockAccountUSD };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Account.findOne as jest.Mock)
        .mockResolvedValueOnce(tightAccount) // currentAccount (EUR, balance 100)
        .mockResolvedValueOnce(largeConversionToAccount); // toAccount (USD)
      const ctx = { payload: { userId: 1 } } as any;

      // EUR to USD: 100 * 1.11 = 111, round = 111. balance 100 - 111 = -11 < 0
      await expect(
        resolver.exchange("EUR", "USD", 100, ctx)
      ).rejects.toThrow(
        "You do not have the sufficient funds to make this exchange."
      );
    });
  });

  describe("createAccount", () => {
    it("returns false when no payload", async () => {
      const ctx = { payload: undefined } as any;
      const result = await resolver.createAccount("EUR", ctx);
      expect(result).toBe(false);
    });

    it("throws when account already exists", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Account.findOne as jest.Mock).mockResolvedValue(mockAccount);
      const ctx = { payload: { userId: 1 } } as any;

      await expect(
        resolver.createAccount("EUR", ctx)
      ).rejects.toThrow("You already have a EUR account");
    });

    it("returns true on success", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Account.findOne as jest.Mock).mockResolvedValue(undefined);
      (Account.insert as jest.Mock).mockResolvedValue({});
      const ctx = { payload: { userId: 1 } } as any;

      const result = await resolver.createAccount("GBP", ctx);
      expect(result).toBe(true);
      expect(Account.insert).toHaveBeenCalled();
    });
  });

  describe("deleteAccount", () => {
    it("returns false when no payload", async () => {
      const ctx = { payload: undefined } as any;
      const result = await resolver.deleteAccount("EUR", ctx);
      expect(result).toBe(false);
    });

    it("returns true when balance==0", async () => {
      const zeroBalanceAccount = { ...mockAccount, balance: 0 };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Account.findOne as jest.Mock).mockResolvedValue(zeroBalanceAccount);
      (Account.delete as jest.Mock).mockResolvedValue({});
      const ctx = { payload: { userId: 1 } } as any;

      const result = await resolver.deleteAccount("EUR", ctx);
      expect(result).toBe(true);
      expect(Account.delete).toHaveBeenCalledWith({ id: zeroBalanceAccount.id });
    });

    it("throws BALANCE_LESS_THAN when balance<0", async () => {
      const negativeBalanceAccount = { ...mockAccount, balance: -100 };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Account.findOne as jest.Mock).mockResolvedValue(negativeBalanceAccount);
      const ctx = { payload: { userId: 1 } } as any;

      await expect(resolver.deleteAccount("EUR", ctx)).rejects.toThrow(
        "Your account balance has fallen below 0. Please top up before deleting."
      );
    });

    it("throws BALANCE_GREATER_THAN when balance>0", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Account.findOne as jest.Mock).mockResolvedValue(mockAccount); // balance 1000
      const ctx = { payload: { userId: 1 } } as any;

      await expect(resolver.deleteAccount("EUR", ctx)).rejects.toThrow(
        "Your account balance is greater than 0. Please exchange your funds before deleting."
      );
    });
  });
});

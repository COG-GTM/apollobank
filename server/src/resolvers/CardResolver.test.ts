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

jest.mock("../entity/Card", () => ({
  Card: {
    find: jest.fn(),
    findOne: jest.fn(),
    insert: jest.fn(),
  },
}));

// Mock createRandom utils
jest.mock("../utils/createRandom", () => ({
  createRandomCardNumber: jest.fn().mockReturnValue("1234 5678 9012 3456"),
  createRandomNumber: jest.fn().mockReturnValue("1234"),
  createRandomSortCode: jest.fn().mockReturnValue("12-34-56"),
  createRandomIbanCode: jest.fn().mockReturnValue("GB12 AP0L 1234 5678 9012 34"),
  createRandomBicCode: jest.fn().mockReturnValue("AP0LGB12"),
}));

import { CardResolver } from "./CardResolver";
import { User } from "../entity/User";
import { Account } from "../entity/Account";
import { Card } from "../entity/Card";

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

const mockCards = [
  {
    id: 1,
    owner: mockUser,
    cardNumber: "1234 5678 9012 3456",
    expiresIn: new Date(2023, 9),
    pin: 1234,
    cvv: 123,
    monthlySpendingLimit: 500,
  },
];

describe("CardResolver", () => {
  let resolver: CardResolver;

  beforeEach(() => {
    resolver = new CardResolver();
    jest.clearAllMocks();
  });

  describe("cards", () => {
    it("returns null when no payload", async () => {
      const ctx = { payload: undefined } as any;
      const result = await resolver.cards(ctx);
      expect(result).toBeNull();
    });

    it("returns cards for account", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Account.findOne as jest.Mock).mockResolvedValue(mockAccount);
      (Card.find as jest.Mock).mockResolvedValue(mockCards);
      const ctx = { payload: { userId: 1 } } as any;

      const result = await resolver.cards(ctx);
      expect(result).toEqual(mockCards);
      expect(Card.find).toHaveBeenCalledWith({
        where: { account: mockAccount },
      });
    });
  });

  describe("createCard", () => {
    it("returns false when no payload", async () => {
      const ctx = { payload: undefined } as any;
      const result = await resolver.createCard(ctx);
      expect(result).toBe(false);
    });

    it("returns true on success", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Card.insert as jest.Mock).mockResolvedValue({});
      const ctx = { payload: { userId: 1 } } as any;

      const result = await resolver.createCard(ctx);
      expect(result).toBe(true);
      expect(Card.insert).toHaveBeenCalled();
    });

    it("returns false when insert fails", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Card.insert as jest.Mock).mockRejectedValue(new Error("insert error"));
      const ctx = { payload: { userId: 1 } } as any;

      const result = await resolver.createCard(ctx);
      expect(result).toBe(false);
    });
  });
});

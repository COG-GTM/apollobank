import "reflect-metadata";

process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";

// Mock bcryptjs
jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mock-token"),
  verify: jest.fn(),
}));

// Mock sendRefreshToken
jest.mock("../utils/sendRefreshToken", () => ({
  sendRefreshToken: jest.fn(),
}));

// Mock typeorm getConnection
jest.mock("typeorm", () => {
  const incrementMock = jest.fn().mockResolvedValue(undefined);
  return {
    getConnection: jest.fn().mockReturnValue({
      getRepository: jest.fn().mockReturnValue({
        increment: incrementMock,
      }),
    }),
    // Re-export decorators as no-ops so entity imports don't break
    Entity: () => () => {},
    PrimaryGeneratedColumn: () => () => {},
    Column: () => () => {},
    BaseEntity: class {},
    ManyToOne: () => () => {},
    OneToMany: () => () => {},
  };
});

// Mock type-graphql decorators as no-ops
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

// Mock entity static methods
jest.mock("../entity/User", () => {
  return {
    User: {
      findOne: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
});

import { UserResolver } from "./UserResolver";
import { User } from "../entity/User";
import { hash, compare } from "bcryptjs";
import { verify } from "jsonwebtoken";
import { sendRefreshToken } from "../utils/sendRefreshToken";
import { getConnection } from "typeorm";

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

describe("UserResolver", () => {
  let resolver: UserResolver;

  beforeEach(() => {
    resolver = new UserResolver();
    jest.clearAllMocks();
  });

  describe("me", () => {
    it("returns null with no auth header", () => {
      const ctx = {
        req: { headers: {} },
        res: {},
      } as any;

      const result = resolver.me(ctx);
      expect(result).toBeNull();
    });

    it("returns null on invalid token", () => {
      (verify as jest.Mock).mockImplementation(() => {
        throw new Error("invalid token");
      });

      const ctx = {
        req: { headers: { authorization: "Bearer invalid-token" } },
        res: {},
      } as any;

      const result = resolver.me(ctx);
      expect(result).toBeNull();
    });

    it("returns user on valid token", async () => {
      (verify as jest.Mock).mockReturnValue({ userId: 1 });
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const ctx = {
        req: { headers: { authorization: "Bearer valid-token" } },
        res: {},
      } as any;

      const result = await resolver.me(ctx);
      expect(verify).toHaveBeenCalledWith("valid-token", "test-access-secret");
      expect(User.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe("logout", () => {
    it("calls sendRefreshToken with empty string and returns true", async () => {
      const mockRes = { cookie: jest.fn().mockReturnThis() };
      const ctx = { res: mockRes } as any;

      const result = await resolver.logout(ctx);
      expect(sendRefreshToken).toHaveBeenCalledWith(mockRes, "");
      expect(result).toBe(true);
    });
  });

  describe("revokeRefreshTokensForUser", () => {
    it("calls increment on repository and returns true", async () => {
      const result = await resolver.revokeRefreshTokensForUser(1);

      const mockGetConnection = getConnection as jest.Mock;
      expect(mockGetConnection).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe("login", () => {
    it("throws on invalid schema", async () => {
      const ctx = { res: { cookie: jest.fn().mockReturnThis() } } as any;

      await expect(
        resolver.login("not-an-email", "pw", ctx)
      ).rejects.toThrow("Something went wrong.");
    });

    it('throws "Invalid login." when user not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(undefined);
      const ctx = { res: { cookie: jest.fn().mockReturnThis() } } as any;

      await expect(
        resolver.login("test@example.com", "Password123", ctx)
      ).rejects.toThrow("Invalid login.");
    });

    it('throws "Invalid password." on wrong password', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(false);
      const ctx = { res: { cookie: jest.fn().mockReturnThis() } } as any;

      await expect(
        resolver.login("test@example.com", "Password123", ctx)
      ).rejects.toThrow("Invalid password.");
    });

    it("returns accessToken and user on success", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(true);
      const mockRes = { cookie: jest.fn().mockReturnThis() };
      const ctx = { res: mockRes } as any;

      const result = await resolver.login("test@example.com", "Password123", ctx);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("user");
      expect(result.user).toEqual(mockUser);
      expect(sendRefreshToken).toHaveBeenCalled();
    });
  });

  describe("register", () => {
    it("returns false on invalid schema", async () => {
      const result = await resolver.register(
        "not-an-email", "pw", "John", "Doe", "1990-01-01",
        "123 Main St", "12345", "TestCity", "TestCountry"
      );
      expect(result).toBe(false);
    });

    it("returns true on successful registration", async () => {
      (hash as jest.Mock).mockResolvedValue("hashedpassword");
      (User.insert as jest.Mock).mockResolvedValue({});

      const result = await resolver.register(
        "test@example.com", "Password123", "John", "Doe", "1990-01-01",
        "123 Main St", "12345", "TestCity", "TestCountry"
      );
      expect(result).toBe(true);
      expect(hash).toHaveBeenCalledWith("Password123", 12);
      expect(User.insert).toHaveBeenCalled();
    });

    it("returns false if User.insert throws", async () => {
      (hash as jest.Mock).mockResolvedValue("hashedpassword");
      (User.insert as jest.Mock).mockRejectedValue(new Error("duplicate"));

      const result = await resolver.register(
        "test@example.com", "Password123", "John", "Doe", "1990-01-01",
        "123 Main St", "12345", "TestCity", "TestCountry"
      );
      expect(result).toBe(false);
    });
  });

  describe("updatePassword", () => {
    it("returns false when no payload", async () => {
      const ctx = { payload: undefined } as any;
      const result = await resolver.updatePassword("oldPass1", "newPass1", ctx);
      expect(result).toBe(false);
    });

    it("returns false on invalid schema", async () => {
      const ctx = { payload: { userId: 1 } } as any;
      // newPassword "pw" is too short to pass validation
      const result = await resolver.updatePassword("oldPass1", "pw", ctx);
      expect(result).toBe(false);
    });

    it("throws error when old password is wrong", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(false);
      const ctx = { payload: { userId: 1 } } as any;

      await expect(
        resolver.updatePassword("WrongPass1", "NewPass123", ctx)
      ).rejects.toThrow(
        "Could not change your password, are you sure you entered the correct password?"
      );
    });

    it("returns true when password updated successfully", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(true);
      (hash as jest.Mock).mockResolvedValue("newhashed");
      (User.update as jest.Mock).mockResolvedValue({});
      const ctx = { payload: { userId: 1 } } as any;

      const result = await resolver.updatePassword("OldPass123", "NewPass123", ctx);
      expect(result).toBe(true);
      expect(hash).toHaveBeenCalledWith("NewPass123", 12);
      expect(User.update).toHaveBeenCalled();
    });
  });

  describe("destroyAccount", () => {
    it("returns false when no payload", async () => {
      const ctx = { payload: undefined } as any;
      const result = await resolver.destroyAccount(ctx);
      expect(result).toBe(false);
    });

    it("returns true when user deleted", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (User.delete as jest.Mock).mockResolvedValue({});
      const ctx = { payload: { userId: 1 } } as any;

      const result = await resolver.destroyAccount(ctx);
      expect(result).toBe(true);
      expect(User.delete).toHaveBeenCalledWith({ id: mockUser.id });
    });

    it("throws error when delete fails", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (User.delete as jest.Mock).mockRejectedValue(new Error("db error"));
      const ctx = { payload: { userId: 1 } } as any;

      await expect(resolver.destroyAccount(ctx)).rejects.toThrow(
        "Failed to destroy account."
      );
    });
  });
});

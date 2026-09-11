import { registerSchema, loginSchema, changePasswordSchema } from "./validation";

describe("registerSchema", () => {
	it("accepts a valid email, alphanumeric password and past date of birth", async () => {
		// Arrange
		const input = { email: "user@apollobank.com", password: "password123", dateOfBirth: "1990-01-01" };

		// Act
		const result = await registerSchema.validateAsync(input);

		// Assert
		expect(result.email).toBe("user@apollobank.com");
	});

	it("rejects a password shorter than six characters", async () => {
		// Arrange
		const input = { email: "user@apollobank.com", password: "abc12", dateOfBirth: "1990-01-01" };

		// Act & Assert
		await expect(registerSchema.validateAsync(input)).rejects.toThrow(/password/);
	});

	it("rejects a password containing non alphanumeric characters", async () => {
		// Arrange
		const input = { email: "user@apollobank.com", password: "p@ssword!", dateOfBirth: "1990-01-01" };

		// Act & Assert
		await expect(registerSchema.validateAsync(input)).rejects.toThrow(/password/);
	});

	it("rejects a date of birth in the future", async () => {
		// Arrange
		const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
		const input = { email: "user@apollobank.com", password: "password123", dateOfBirth: tomorrow };

		// Act & Assert
		await expect(registerSchema.validateAsync(input)).rejects.toThrow(/dateOfBirth/);
	});

	it("rejects a malformed email address", async () => {
		// Arrange
		const input = { email: "not-an-email", password: "password123", dateOfBirth: "1990-01-01" };

		// Act & Assert
		await expect(registerSchema.validateAsync(input)).rejects.toThrow(/email/);
	});

	it("rejects unknown extra keys", async () => {
		// Arrange
		const input = {
			email: "user@apollobank.com",
			password: "password123",
			dateOfBirth: "1990-01-01",
			isAdmin: true,
		};

		// Act & Assert
		await expect(registerSchema.validateAsync(input)).rejects.toThrow(/isAdmin/);
	});
});

describe("loginSchema", () => {
	it("accepts a valid email and password", async () => {
		// Arrange
		const input = { email: "user@apollobank.com", password: "password123" };

		// Act
		const result = await loginSchema.validateAsync(input);

		// Assert
		expect(result).toEqual(input);
	});

	it("rejects a missing password", async () => {
		// Arrange
		const input = { email: "user@apollobank.com" };

		// Act & Assert
		await expect(loginSchema.validateAsync(input)).rejects.toThrow(/password/);
	});

	it("rejects a password of exactly 31 alphanumeric characters", async () => {
		// Arrange
		const input = { email: "user@apollobank.com", password: "a".repeat(31) };

		// Act & Assert
		await expect(loginSchema.validateAsync(input)).rejects.toThrow(/password/);
	});
});

describe("changePasswordSchema", () => {
	it("accepts a new alphanumeric password of at least six characters", async () => {
		// Arrange
		const input = { oldPassword: "old", newPassword: "newpassword1" };

		// Act
		const result = await changePasswordSchema.validateAsync(input);

		// Assert
		expect(result.newPassword).toBe("newpassword1");
	});

	it("allows the old password to be omitted", async () => {
		// Arrange
		const input = { newPassword: "newpassword1" };

		// Act
		const result = await changePasswordSchema.validateAsync(input);

		// Assert
		expect(result).toEqual(input);
	});

	it("rejects a new password that is too short", async () => {
		// Arrange
		const input = { oldPassword: "oldpassword1", newPassword: "abc" };

		// Act & Assert
		await expect(changePasswordSchema.validateAsync(input)).rejects.toThrow(/newPassword/);
	});
});

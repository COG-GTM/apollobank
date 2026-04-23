import { registerSchema, loginSchema, changePasswordSchema } from "./validation";

describe("registerSchema", () => {
	it("passes with valid input", () => {
		const result = registerSchema.validate({
			email: "test@example.com",
			password: "password123",
			dateOfBirth: new Date("1990-01-01"),
		});
		expect(result.error).toBeUndefined();
	});

	it("fails with invalid email", () => {
		const result = registerSchema.validate({
			email: "not-an-email",
			password: "password123",
			dateOfBirth: new Date("1990-01-01"),
		});
		expect(result.error).toBeDefined();
	});

	it("fails with short password", () => {
		const result = registerSchema.validate({
			email: "test@example.com",
			password: "ab",
			dateOfBirth: new Date("1990-01-01"),
		});
		expect(result.error).toBeDefined();
	});

	it("fails with future date of birth", () => {
		const futureDate = new Date();
		futureDate.setFullYear(futureDate.getFullYear() + 1);
		const result = registerSchema.validate({
			email: "test@example.com",
			password: "password123",
			dateOfBirth: futureDate,
		});
		expect(result.error).toBeDefined();
	});
});

describe("loginSchema", () => {
	it("passes with valid input", () => {
		const result = loginSchema.validate({
			email: "test@example.com",
			password: "password123",
		});
		expect(result.error).toBeUndefined();
	});

	it("fails with invalid email", () => {
		const result = loginSchema.validate({
			email: "not-an-email",
			password: "password123",
		});
		expect(result.error).toBeDefined();
	});

	it("fails with short password", () => {
		const result = loginSchema.validate({
			email: "test@example.com",
			password: "ab",
		});
		expect(result.error).toBeDefined();
	});
});

describe("changePasswordSchema", () => {
	it("passes with valid input", () => {
		const result = changePasswordSchema.validate({
			oldPassword: "oldpass123",
			newPassword: "newpass123",
		});
		expect(result.error).toBeUndefined();
	});

	it("fails with invalid newPassword", () => {
		const result = changePasswordSchema.validate({
			oldPassword: "oldpass123",
			newPassword: "ab",
		});
		expect(result.error).toBeDefined();
	});
});

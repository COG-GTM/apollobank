import { loginValidationSchema } from './loginValidationSchema';

describe('loginValidationSchema', () => {
    it('should validate a correct login form', async () => {
        const validData = { email: 'test@example.com', password: 'password123' };
        await expect(loginValidationSchema.isValid(validData)).resolves.toBe(true);
    });

    it('should reject an invalid email', async () => {
        const invalidData = { email: 'not-an-email', password: 'password123' };
        await expect(loginValidationSchema.isValid(invalidData)).resolves.toBe(false);
    });

    it('should reject an empty email', async () => {
        const invalidData = { email: '', password: 'password123' };
        await expect(loginValidationSchema.isValid(invalidData)).resolves.toBe(false);
    });

    it('should reject a password shorter than 6 characters', async () => {
        const invalidData = { email: 'test@example.com', password: '12345' };
        await expect(loginValidationSchema.isValid(invalidData)).resolves.toBe(false);
    });

    it('should accept a password with exactly 6 characters', async () => {
        const validData = { email: 'test@example.com', password: '123456' };
        await expect(loginValidationSchema.isValid(validData)).resolves.toBe(true);
    });
});

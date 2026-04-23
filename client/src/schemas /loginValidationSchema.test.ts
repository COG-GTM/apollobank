import { loginValidationSchema } from './loginValidationSchema';

describe('loginValidationSchema', () => {
    it('validates correct login data', async () => {
        const data = { email: 'test@test.com', password: 'password123' };
        await expect(loginValidationSchema.validate(data)).resolves.toBeDefined();
    });

    it('rejects invalid email', async () => {
        const data = { email: 'notanemail', password: 'password123' };
        await expect(loginValidationSchema.validate(data)).rejects.toThrow();
    });

    it('rejects missing email', async () => {
        const data = { password: 'password123' };
        await expect(loginValidationSchema.validate(data)).rejects.toThrow();
    });

    it('rejects short password', async () => {
        const data = { email: 'test@test.com', password: 'ab' };
        await expect(loginValidationSchema.validate(data)).rejects.toThrow();
    });

    it('accepts empty password (lazy validation)', async () => {
        const data = { email: 'test@test.com', password: '' };
        await expect(loginValidationSchema.validate(data)).resolves.toBeDefined();
    });
});

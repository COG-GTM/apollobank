import { registerValidationSchema } from './registerValidationSchema';

describe('registerValidationSchema', () => {
    const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        streetAddres: '123 Main St',
        postCode: '12345',
        city: 'London',
        country: 'UK',
        password: 'password123',
        confirmPassword: 'password123',
        dateOfBirth: new Date('1990-01-01'),
    };

    it('validates correct registration data', async () => {
        await expect(registerValidationSchema.validate(validData)).resolves.toBeDefined();
    });

    it('rejects missing first name', async () => {
        const data = { ...validData, firstName: '' };
        await expect(registerValidationSchema.validate(data)).rejects.toThrow();
    });

    it('rejects missing email', async () => {
        const data = { ...validData, email: '' };
        await expect(registerValidationSchema.validate(data)).rejects.toThrow();
    });

    it('rejects invalid email', async () => {
        const data = { ...validData, email: 'notanemail' };
        await expect(registerValidationSchema.validate(data)).rejects.toThrow();
    });

    it('rejects short password', async () => {
        const data = { ...validData, password: 'ab', confirmPassword: 'ab' };
        await expect(registerValidationSchema.validate(data)).rejects.toThrow();
    });

    it('rejects mismatched passwords', async () => {
        const data = { ...validData, confirmPassword: 'different' };
        await expect(registerValidationSchema.validate(data)).rejects.toThrow();
    });

    it('rejects future date of birth', async () => {
        const data = { ...validData, dateOfBirth: new Date('2099-01-01') };
        await expect(registerValidationSchema.validate(data)).rejects.toThrow();
    });

    it('accepts empty password (lazy validation)', async () => {
        const data = { ...validData, password: '', confirmPassword: '' };
        await expect(registerValidationSchema.validate(data)).resolves.toBeDefined();
    });
});

import { registerValidationSchema } from './registerValidationSchema';

describe('registerValidationSchema', () => {
    const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        streetAddres: '123 Main St',
        postCode: '12345',
        city: 'New York',
        country: 'USA',
        password: 'password123',
        confirmPassword: 'password123',
        dateOfBirth: '1990-01-01',
    };

    it('should validate correct registration data', async () => {
        await expect(registerValidationSchema.isValid(validData)).resolves.toBe(true);
    });

    it('should reject missing first name', async () => {
        const data = { ...validData, firstName: '' };
        await expect(registerValidationSchema.isValid(data)).resolves.toBe(false);
    });

    it('should reject missing last name', async () => {
        const data = { ...validData, lastName: '' };
        await expect(registerValidationSchema.isValid(data)).resolves.toBe(false);
    });

    it('should reject invalid email', async () => {
        const data = { ...validData, email: 'invalid' };
        await expect(registerValidationSchema.isValid(data)).resolves.toBe(false);
    });

    it('should reject missing street address', async () => {
        const data = { ...validData, streetAddres: '' };
        await expect(registerValidationSchema.isValid(data)).resolves.toBe(false);
    });

    it('should reject missing post code', async () => {
        const data = { ...validData, postCode: '' };
        await expect(registerValidationSchema.isValid(data)).resolves.toBe(false);
    });

    it('should reject missing city', async () => {
        const data = { ...validData, city: '' };
        await expect(registerValidationSchema.isValid(data)).resolves.toBe(false);
    });

    it('should reject missing country', async () => {
        const data = { ...validData, country: '' };
        await expect(registerValidationSchema.isValid(data)).resolves.toBe(false);
    });

    it('should reject passwords that do not match', async () => {
        const data = { ...validData, confirmPassword: 'different' };
        await expect(registerValidationSchema.isValid(data)).resolves.toBe(false);
    });

    it('should reject a password shorter than 6 characters', async () => {
        const data = { ...validData, password: '12345', confirmPassword: '12345' };
        await expect(registerValidationSchema.isValid(data)).resolves.toBe(false);
    });

    it('should reject a future date of birth', async () => {
        const data = { ...validData, dateOfBirth: '2099-01-01' };
        await expect(registerValidationSchema.isValid(data)).resolves.toBe(false);
    });

    it('should reject an invalid date of birth', async () => {
        const data = { ...validData, dateOfBirth: 'not-a-date' };
        await expect(registerValidationSchema.isValid(data)).resolves.toBe(false);
    });
});

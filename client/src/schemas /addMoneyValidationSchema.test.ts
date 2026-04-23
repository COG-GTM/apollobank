import { addMoneyValidationSchema } from './addMoneyValidationSchema';

describe('addMoneyValidationSchema', () => {
    it('should validate a positive integer amount', async () => {
        await expect(addMoneyValidationSchema.isValid({ amount: 100 })).resolves.toBe(true);
    });

    it('should reject a negative amount', async () => {
        await expect(addMoneyValidationSchema.isValid({ amount: -10 })).resolves.toBe(false);
    });

    it('should reject zero', async () => {
        await expect(addMoneyValidationSchema.isValid({ amount: 0 })).resolves.toBe(false);
    });

    it('should reject a non-integer amount', async () => {
        await expect(addMoneyValidationSchema.isValid({ amount: 10.5 })).resolves.toBe(false);
    });

    it('should reject a missing amount', async () => {
        await expect(addMoneyValidationSchema.isValid({})).resolves.toBe(false);
    });
});

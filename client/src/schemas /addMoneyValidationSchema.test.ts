import { addMoneyValidationSchema } from './addMoneyValidationSchema';

describe('addMoneyValidationSchema', () => {
    it('validates a positive integer amount', async () => {
        await expect(addMoneyValidationSchema.validate({ amount: 100 })).resolves.toEqual({ amount: 100 });
    });

    it('rejects a negative amount', async () => {
        await expect(addMoneyValidationSchema.validate({ amount: -5 })).rejects.toThrow();
    });

    it('rejects zero', async () => {
        await expect(addMoneyValidationSchema.validate({ amount: 0 })).rejects.toThrow();
    });

    it('rejects missing amount', async () => {
        await expect(addMoneyValidationSchema.validate({})).rejects.toThrow();
    });
});

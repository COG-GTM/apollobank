import { changePasswordValidationSchema } from './changePasswordValidationSchema';

describe('changePasswordValidationSchema', () => {
    it('validates correct password change data', async () => {
        const data = { oldPassword: 'oldPass1', newPassword: 'newPass1', confirmPassword: 'newPass1' };
        await expect(changePasswordValidationSchema.validate(data)).resolves.toBeDefined();
    });

    it('rejects short new password', async () => {
        const data = { oldPassword: 'oldPass1', newPassword: 'ab', confirmPassword: 'ab' };
        await expect(changePasswordValidationSchema.validate(data)).rejects.toThrow();
    });

    it('rejects mismatched confirm password', async () => {
        const data = { oldPassword: 'oldPass1', newPassword: 'newPass1', confirmPassword: 'different' };
        await expect(changePasswordValidationSchema.validate(data)).rejects.toThrow();
    });

    it('accepts empty new password (lazy validation)', async () => {
        const data = { oldPassword: 'oldPass1', newPassword: '', confirmPassword: '' };
        await expect(changePasswordValidationSchema.validate(data)).resolves.toBeDefined();
    });
});

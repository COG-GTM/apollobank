import { changePasswordValidationSchema } from './changePasswordValidationSchema';

describe('changePasswordValidationSchema', () => {
    it('should validate matching passwords with sufficient length', async () => {
        const data = {
            oldPassword: 'oldpass123',
            newPassword: 'newpass123',
            confirmPassword: 'newpass123',
        };
        await expect(changePasswordValidationSchema.isValid(data)).resolves.toBe(true);
    });

    it('should reject a new password shorter than 6 characters', async () => {
        const data = {
            oldPassword: 'oldpass123',
            newPassword: '12345',
            confirmPassword: '12345',
        };
        await expect(changePasswordValidationSchema.isValid(data)).resolves.toBe(false);
    });

    it('should reject mismatched confirm password', async () => {
        const data = {
            oldPassword: 'oldpass123',
            newPassword: 'newpass123',
            confirmPassword: 'different',
        };
        await expect(changePasswordValidationSchema.isValid(data)).resolves.toBe(false);
    });

    it('should accept empty old password', async () => {
        const data = {
            oldPassword: '',
            newPassword: 'newpass123',
            confirmPassword: 'newpass123',
        };
        await expect(changePasswordValidationSchema.isValid(data)).resolves.toBe(true);
    });
});

import { ColorScheme, theme } from './theme';

describe('ColorScheme', () => {
    it('all ColorScheme enum values exist and are hex color strings', () => {
        const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
        expect(ColorScheme.PRIMARY).toMatch(hexColorRegex);
        expect(ColorScheme.SECONDARY).toMatch(hexColorRegex);
        expect(ColorScheme.ORANGE).toMatch(hexColorRegex);
        expect(ColorScheme.MAROON).toMatch(hexColorRegex);
        expect(ColorScheme.WHITE).toMatch(hexColorRegex);
        expect(ColorScheme.HOVER).toMatch(hexColorRegex);
        expect(ColorScheme.PRIMARY_HOVER).toMatch(hexColorRegex);
    });
});

describe('theme', () => {
    it('theme object is defined and has palette with primary, secondary, info', () => {
        expect(theme).toBeDefined();
        expect(theme.palette).toBeDefined();
        expect(theme.palette.primary.main).toBe(ColorScheme.PRIMARY);
        expect(theme.palette.secondary.main).toBe(ColorScheme.ORANGE);
        expect(theme.palette.info.main).toBe(ColorScheme.MAROON);
    });
});

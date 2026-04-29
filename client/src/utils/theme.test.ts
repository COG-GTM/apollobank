import { ColorScheme, theme } from './theme';

describe('ColorScheme', () => {
    it('should have the correct PRIMARY color', () => {
        expect(ColorScheme.PRIMARY).toBe('#222B2D');
    });

    it('should have the correct SECONDARY color', () => {
        expect(ColorScheme.SECONDARY).toBe('#29AABB');
    });

    it('should have the correct ORANGE color', () => {
        expect(ColorScheme.ORANGE).toBe('#F15742');
    });

    it('should have the correct MAROON color', () => {
        expect(ColorScheme.MAROON).toBe('#432D32');
    });

    it('should have the correct WHITE color', () => {
        expect(ColorScheme.WHITE).toBe('#FFFEF9');
    });

    it('should have the correct HOVER color', () => {
        expect(ColorScheme.HOVER).toBe('#148C9C');
    });

    it('should have the correct PRIMARY_HOVER color', () => {
        expect(ColorScheme.PRIMARY_HOVER).toBe('#090c0c');
    });
});

describe('theme', () => {
    it('should have primary color set to ColorScheme.PRIMARY', () => {
        expect(theme.palette.primary.main).toBe(ColorScheme.PRIMARY);
    });

    it('should have secondary color set to ColorScheme.ORANGE', () => {
        expect(theme.palette.secondary.main).toBe(ColorScheme.ORANGE);
    });

    it('should have info color set to ColorScheme.MAROON', () => {
        expect(theme.palette.info.main).toBe(ColorScheme.MAROON);
    });

    it('should have contrastThreshold set to 3', () => {
        expect(theme.palette.contrastThreshold).toBe(3);
    });

    it('should have tonalOffset set to 0.2', () => {
        expect(theme.palette.tonalOffset).toBe(0.2);
    });
});

import { createUseStyles } from 'react-jss';
import { ColorScheme } from '../../utils/theme';

export const useSpendingInsightsStyles = createUseStyles({
    root: {
        width: '100%',
    },
    title: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 16,
    },
    tile: {
        height: '100%',
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(41, 170, 187, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
    },
    tileLabel: {
        fontSize: 12,
        fontWeight: 'normal',
        color: 'rgba(0, 0, 0, 0.54)',
        marginBottom: 4,
    },
    tileValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: ColorScheme.PRIMARY,
        wordBreak: 'break-word',
    },
    tileSubValue: {
        fontSize: 12,
        fontWeight: 'normal',
        color: 'rgba(0, 0, 0, 0.54)',
        textTransform: 'capitalize',
    },
    up: {
        color: ColorScheme.ORANGE,
    },
    down: {
        color: ColorScheme.SECONDARY,
    },
    chartTitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
    },
    chart: {
        width: '100%',
        height: 300,
    },
    message: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 120,
        fontWeight: 'normal',
        color: 'rgba(0, 0, 0, 0.54)',
        textAlign: 'center',
    },
    error: {
        color: ColorScheme.ORANGE,
    },
});

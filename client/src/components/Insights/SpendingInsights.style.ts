import { createUseStyles } from 'react-jss';
import { ColorScheme } from '../../utils/theme';

export const useSpendingInsightsStyles = createUseStyles({
    root: {
        width: '100%',
        fontWeight: 'normal',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: ColorScheme.PRIMARY,
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(0, 0, 0, 0.5)',
    },
    kpis: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
        gap: 12,
        marginBottom: 24,
        '@media (max-width: 960px)': {
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        },
        '@media (max-width: 600px)': {
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        },
    },
    kpi: {
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: 8,
        padding: 12,
        minWidth: 0,
    },
    kpiLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: 'rgba(0, 0, 0, 0.5)',
        marginBottom: 6,
    },
    kpiValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: ColorScheme.PRIMARY,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        '@media (max-width: 600px)': {
            fontSize: 16,
        },
    },
    kpiHint: {
        fontSize: 12,
        color: 'rgba(0, 0, 0, 0.5)',
        marginTop: 4,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    positive: {
        color: ColorScheme.SECONDARY,
    },
    negative: {
        color: ColorScheme.ORANGE,
    },
    charts: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
        gap: 24,
        '@media (max-width: 960px)': {
            gridTemplateColumns: 'minmax(0, 1fr)',
        },
    },
    chartBox: {
        height: 280,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
    },
    chartTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: ColorScheme.PRIMARY,
        marginBottom: 8,
    },
    chartBody: {
        flex: 1,
        minHeight: 0,
    },
    message: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 120,
        color: 'rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
    },
    error: {
        color: ColorScheme.ORANGE,
    },
});

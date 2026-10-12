import { createUseStyles } from 'react-jss';

export const useChartStyles = createUseStyles({
    root: {
        width: '100%',
        height: '320px',
        display: 'flex',
        flexDirection: 'column',
    },
    spending: {
        display: 'flex',
        justifyContent: 'center',
    },
    chartArea: {
        flex: 1,
        minHeight: 0,
    },
    emptyState: {
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#8A8A8A',
        fontSize: 16,
    },
});

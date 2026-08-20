import { useMantineTheme } from '@mantine/core';

const getStatusColor = (status) => {
    const theme = useMantineTheme();
    const statusColor = {
        success: theme.colors.green[6],
        running: theme.colors.blue[6],
        failed: theme.colors.red[6],
        cancelled: theme.colors.yellow[6],
        default: theme.colors.gray[6]
    };

    return statusColor[status] || statusColor.default;
};

export default getStatusColor;

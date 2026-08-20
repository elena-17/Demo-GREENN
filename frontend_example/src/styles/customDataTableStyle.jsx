export const customDataTableStyles = (theme, isDark) => ({
  table: {
    style: {
      fontFamily: 'var(--mantine-font-family)',
    },
  },
  headRow: {
    style: {
      backgroundColor: isDark ? theme.colors.dark[7] : theme.colors.gray[1],
      fontSize: theme.fontSizes.sm,
      fontWeight: 700,
    },
  },
  headCells: {
    style: {
      color: isDark ? theme.colors.gray[3] : theme.colors.dark[7],
    },
  },
  rows: {
    style: {
      backgroundColor: isDark ? theme.colors.dark[6] : theme.white,
      color: isDark ? theme.colors.gray[3] : theme.colors.dark[7],
      '&:not(:last-of-type)': {
        borderBottom: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
      },
    },
    highlightOnHoverStyle: {
      backgroundColor: isDark ? theme.colors.dark[5] : theme.colors.gray[0],
    },
    stripedStyle: {
      backgroundColor: isDark ? theme.colors.dark[7] : theme.colors.gray[0],
    },
  },
  expanderRow: {
    style: {
      backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
    },
  },
  cells: {
    style: {
      fontSize: theme.fontSizes.sm,
    },
  },
  pagination: {
    style: {
      color: isDark ? theme.colors.gray[5] : theme.colors.gray[7],
      backgroundColor: isDark ? theme.colors.dark[6] : theme.white,
      borderTop: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
    },
    pageButtonsStyle: {
      color: isDark ? theme.colors.gray[3] : theme.colors.dark[7],
      '&:disabled': {
        color: isDark ? theme.colors.dark[3] : theme.colors.gray[5],
      },
    },
  },
  noData: {
    style: {
      backgroundColor: 'transparent',
    },
  },
});

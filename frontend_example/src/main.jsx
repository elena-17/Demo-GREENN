import App from './App.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createTheme, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
// import './styles/general.css';
import '@mantine/charts/styles.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/dates/styles.css';
import { ProjectsProvider } from './contexts/projectsContext.jsx';
import { DatesProvider } from '@mantine/dates';

const theme = createTheme({
  primaryColor: 'green',
  components: {
    Title: {
      styles: (theme) => ({
        root: {
          color: theme.colorScheme === 'dark'
            ? theme.colors[theme.primaryColor][9]
            : theme.colors[theme.primaryColor][8],
        },
      }),
    },
  },
});
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme='light'>
      <DatesProvider>
        <Notifications position="top-center"
          autoClose={2000} limit={2} />
        <ModalsProvider>
          <ProjectsProvider>
            <App />
          </ProjectsProvider>
        </ModalsProvider>
      </DatesProvider>
    </MantineProvider>
  </StrictMode>,
)

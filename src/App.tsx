import { useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { MainPage } from './pages/MainPage';
import { useStore } from './store';
import type { EmailAccount } from './types';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9B7FD4',
      light: '#C4A8E0',
      dark: '#6B4FA0',
    },
    secondary: {
      main: '#FF6B9D',
    },
    background: {
      default: '#0A0514',
      paper: '#1A1028',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255,255,255,0.6)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.1) transparent',
        },
        '*::-webkit-scrollbar': {
          width: 6,
        },
        '*::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '*::-webkit-scrollbar-thumb': {
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 3,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1A1028',
          backgroundImage: 'none',
        },
      },
    },
  },
});

function App() {
  const setEmailAccount = useStore((s) => s.setEmailAccount);
  const setActivePanel = useStore((s) => s.setActivePanel);

  // Handle Gmail OAuth callback — tokens returned via URL hash fragment
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const account: EmailAccount = {
        type: 'gmail',
        email: 'Gmail User',
        accessToken: params.get('access_token') || '',
        refreshToken: params.get('refresh_token') || undefined,
        expiresAt: Date.now() + parseInt(params.get('expires_in') || '3600', 10) * 1000,
      };
      setEmailAccount(account);
      // Clean up URL hash without page reload
      window.history.replaceState({}, '', window.location.pathname);
      // Navigate to email panel
      setActivePanel('email');
    }
  }, [setEmailAccount, setActivePanel]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', overflow: 'hidden' }}>
        <MainPage />
      </Box>
    </ThemeProvider>
  );
}

export default App;

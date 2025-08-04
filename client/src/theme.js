import { createTheme } from '@mui/material/styles';

// Paleta de colores basada en el sistema actual
const colors = {
  // Colores principales
  bgGradientStart: '#1c2541', // Azul oscuro más profundo
  bgGradientEnd: '#0b132b',   // Casi negro azulado
  sidebarBg: '#131b33',
  cardBg: 'rgba(42, 54, 84, 0.4)',
  cardBgSolid: '#2a3654',
  cardBorderColor: 'rgba(85, 124, 248, 0.2)',
  cardGlowColor: 'rgba(85, 124, 248, 0.1)',
  
  // Acentos
  primaryAccent: '#557cf8', // Azul principal
  secondaryAccent: '#3a506b', // Azul grisáceo
  
  // Texto
  textPrimary: '#e0e0e0',
  textSecondary: '#a0a0c0',
  textDark: '#374151',
  
  // Estados
  successColor: '#2dd4bf',
  warningColor: '#facc15',
  dangerColor: '#f472b6',
  infoColor: '#38bdf8',
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primaryAccent,
      light: '#7c9fff',
      dark: '#3d5ec7',
    },
    secondary: {
      main: colors.secondaryAccent,
      light: '#5a6b7c',
      dark: '#2a3a4a',
    },
    background: {
      default: colors.bgGradientEnd,
      paper: colors.cardBgSolid,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    success: {
      main: colors.successColor,
    },
    warning: {
      main: colors.warningColor,
    },
    error: {
      main: colors.dangerColor,
    },
    info: {
      main: colors.infoColor,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `linear-gradient(135deg, ${colors.bgGradientStart} 0%, ${colors.bgGradientEnd} 100%)`,
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          margin: 0,
          fontFamily: '"Inter", sans-serif',
          color: colors.textPrimary,
          overflowX: 'hidden',
        },
        '*': {
          boxSizing: 'border-box',
        },
        '::-webkit-scrollbar': {
          height: '10px',
          width: '10px',
        },
        '::-webkit-scrollbar-track': {
          background: colors.cardBgSolid,
          borderRadius: '10px',
        },
        '::-webkit-scrollbar-thumb': {
          background: colors.primaryAccent,
          borderRadius: '10px',
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: colors.secondaryAccent,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: colors.cardBg,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: `1px solid ${colors.cardBorderColor}`,
          borderRadius: 12,
          boxShadow: `0 4px 20px rgba(0, 0, 0, 0.2), 0 0 15px ${colors.cardGlowColor}`,
          '&:hover': {
            boxShadow: `0 6px 25px rgba(0, 0, 0, 0.3), 0 0 20px ${colors.cardGlowColor}`,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 15px ${colors.cardGlowColor}`,
          },
        },
        contained: {
          background: `linear-gradient(45deg, ${colors.primaryAccent}, ${colors.secondaryAccent})`,
          '&:hover': {
            background: `linear-gradient(45deg, ${colors.secondaryAccent}, ${colors.primaryAccent})`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: colors.cardBgSolid,
            border: `1px solid ${colors.cardBorderColor}`,
            borderRadius: 8,
            '&:hover': {
              borderColor: colors.primaryAccent,
            },
            '&.Mui-focused': {
              borderColor: colors.primaryAccent,
              boxShadow: `0 0 10px ${colors.cardGlowColor}`,
            },
          },
          '& .MuiInputLabel-root': {
            color: colors.textSecondary,
          },
          '& .MuiInputBase-input': {
            color: colors.textPrimary,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: colors.cardBgSolid,
          border: `1px solid ${colors.cardBorderColor}`,
          borderRadius: 8,
          '&:hover': {
            borderColor: colors.primaryAccent,
          },
          '&.Mui-focused': {
            borderColor: colors.primaryAccent,
            boxShadow: `0 0 10px ${colors.cardGlowColor}`,
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: colors.cardBg,
          backdropFilter: 'blur(10px)',
          borderRadius: 12,
          border: `1px solid ${colors.cardBorderColor}`,
          overflow: 'hidden',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            color: colors.textSecondary,
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: colors.cardBorderColor,
          color: colors.textPrimary,
          fontSize: '0.875rem',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: colors.cardBorderColor,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '9999px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontSize: '0.75rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.cardBg,
          backdropFilter: 'blur(15px)',
          border: `1px solid ${colors.cardBorderColor}`,
          borderRadius: 12,
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
        },
      },
    },
  },
});

export default theme; 
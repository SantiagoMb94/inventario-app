import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button,
  Container,
  Grid,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Computer as ComputerIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
  
const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/equipos', label: 'Equipment', icon: <ComputerIcon /> },
    { path: '/reportes', label: 'Reports', icon: <AssessmentIcon /> },
    { path: '/configuracion', label: 'Settings', icon: <SettingsIcon /> }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ 
      width: 240, 
      height: '100vh',
      backgroundColor: '#131b33',
      color: '#e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(85, 124, 248, 0.2)',
      padding: '24px'
    }}>
      {/* Sidebar Header */}
      <Box sx={{ textAlign: 'center', marginBottom: '20px' }}>
        <Box
          component="img"
          src="https://i.ibb.co/5hXfGQ5f/Circle-Crop-Image-14.png"
          alt="Logo Inventario"
          sx={{
            width: 60,
            height: 'auto',
            marginBottom: '15px'
          }}
        />
        <Typography
          variant="h1"
          sx={{
            fontSize: '24px',
            marginBottom: 0,
            textAlign: 'center',
            color: '#557cf8',
            fontWeight: 700
          }}
        >
          INVENTORY
        </Typography>
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, marginTop: '20px' }}>
        {menuItems.map((item) => (
          <Button
            key={item.path}
            fullWidth
            startIcon={item.icon}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 15px',
              marginBottom: '8px',
              textDecoration: 'none',
              color: location.pathname === item.path ? '#ffffff' : '#a0a0c0',
              fontWeight: location.pathname === item.path ? 600 : 500,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: '1px solid transparent',
              backgroundColor: location.pathname === item.path 
                ? '#557cf8' 
                : 'transparent',
              boxShadow: location.pathname === item.path 
                ? '0 0 15px rgba(85, 124, 248, 0.4)' 
                : 'none',
              justifyContent: 'flex-start',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: location.pathname === item.path 
                  ? '#557cf8' 
                  : 'rgba(42, 54, 84, 0.4)',
                color: '#ffffff'
              }
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      {/* Sidebar Footer */}
      <Box sx={{ 
        marginTop: 'auto', 
        paddingTop: '15px', 
        borderTop: '1px solid rgba(85, 124, 248, 0.2)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#a0a0c0'
      }}>
        <Typography variant="body2" sx={{ margin: '0.3rem 0' }}>
          © 2025 Santiago Manco Bolaños
        </Typography>
        <Typography variant="body2" sx={{ margin: '0.3rem 0' }}>
          IT Support & Software Developer
        </Typography>
        <Typography variant="body2" sx={{ margin: '0.3rem 0' }}>
          SUTI S.A.S
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          component="nav"
          sx={{
            width: 240,
            flexShrink: 0,
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 1000,
            height: '100vh'
          }}
        >
          {drawerContent}
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 240,
              backgroundColor: 'transparent',
              border: 'none'
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: { xs: 0, md: '240px' },
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        {/* Header */}
        <AppBar 
          position="static" 
          sx={{ 
            backgroundColor: 'transparent',
            boxShadow: 'none',
            borderBottom: '1px solid rgba(85, 124, 248, 0.2)'
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>
                {menuItems.find(item => item.path === location.pathname)?.label || 'Inventory Dashboard'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <IconButton sx={{ color: '#a0a0c0', '&:hover': { color: '#557cf8' } }}>
                <NotificationsIcon />
              </IconButton>
              <IconButton sx={{ color: '#a0a0c0', '&:hover': { color: '#557cf8' } }}>
                <AccountCircleIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ 
          flexGrow: 1, 
          padding: '24px',
          overflowY: 'auto'
        }}>
          <Container maxWidth="xl" sx={{ margin: 0, padding: 0 }}>
            <Outlet />
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 
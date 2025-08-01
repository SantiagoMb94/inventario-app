import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import { 
  CheckCircle, 
  Warning, 
  Error, 
  Info,
  ContentCopy,
  Laptop,
  Person,
  Warehouse
} from '@mui/icons-material';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas
      const statsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/inventario/dashboard/stats`);
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Cargar actividad reciente
      const activityResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/inventario/dashboard/activity`);
      const activityData = await activityResponse.json();
      setActivity(activityData);

    } catch (err) {
      setError('Error al cargar datos del dashboard');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Asignado': return 'success';
      case 'Stock': return 'primary';
      case 'En Reparación': return 'warning';
      case 'De Baja': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Asignado': return <Person />;
      case 'Stock': return <Warehouse />;
      case 'En Reparación': return <Warning />;
      case 'De Baja': return <Error />;
      default: return <Info />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard de Inventario
      </Typography>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" component="h2" color="textSecondary">
                    Total Equipos
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats?.totalEquipos || 0}
                  </Typography>
                </Box>
                <Laptop color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" component="h2" color="textSecondary">
                    Asignados
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats?.totalAsignados || 0}
                  </Typography>
                </Box>
                <Person color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" component="h2" color="textSecondary">
                    En Stock
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {stats?.totalStock || 0}
                  </Typography>
                </Box>
                <Warehouse color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" component="h2" color="textSecondary">
                    En Reparación
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats?.enReparacion || 0}
                  </Typography>
                </Box>
                <Warning color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alertas */}
      {stats?.alertas && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Alertas del Sistema
                </Typography>
                <List>
                  {stats.alertas.equiposSinSerial?.length > 0 && (
                    <ListItem>
                      <ListItemIcon>
                        <Error color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${stats.alertas.equiposSinSerial.length} equipos sin número de serial`}
                        secondary={stats.alertas.equiposSinSerial.map(item => 
                          `${item.nombre} (${item.ubicacion})`
                        ).join(', ')}
                      />
                    </ListItem>
                  )}

                                     {stats.alertas.serialesDuplicados?.length > 0 && (
                     <ListItem>
                       <ListItemIcon>
                         <ContentCopy color="warning" />
                       </ListItemIcon>
                       <ListItemText
                         primary={`${stats.alertas.serialesDuplicados.length} seriales duplicados`}
                         secondary={stats.alertas.serialesDuplicados.map(item => 
                           `${item.value} (${item.count} veces)`
                         ).join(', ')}
                       />
                     </ListItem>
                   )}

                                     {stats.alertas.macLanDuplicadas?.length > 0 && (
                     <ListItem>
                       <ListItemIcon>
                         <ContentCopy color="warning" />
                       </ListItemIcon>
                       <ListItemText
                         primary={`${stats.alertas.macLanDuplicadas.length} MACs LAN duplicadas`}
                         secondary={stats.alertas.macLanDuplicadas.map(item => 
                           `${item.value} (${item.count} veces)`
                         ).join(', ')}
                       />
                     </ListItem>
                   )}

                                     {stats.alertas.macWifiDuplicadas?.length > 0 && (
                     <ListItem>
                       <ListItemIcon>
                         <ContentCopy color="warning" />
                       </ListItemIcon>
                       <ListItemText
                         primary={`${stats.alertas.macWifiDuplicadas.length} MACs WiFi duplicadas`}
                         secondary={stats.alertas.macWifiDuplicadas.map(item => 
                           `${item.value} (${item.count} veces)`
                         ).join(', ')}
                       />
                     </ListItem>
                   )}

                  {(!stats.alertas.equiposSinSerial?.length && 
                    !stats.alertas.serialesDuplicados?.length &&
                    !stats.alertas.macLanDuplicadas?.length &&
                    !stats.alertas.macWifiDuplicadas?.length) && (
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText primary="¡Todo en orden! No hay alertas." />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Actividad Reciente */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actividad Reciente
              </Typography>
              <List>
                {activity.length > 0 ? (
                  activity.slice(0, 10).map((item, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={item[3]}
                        secondary={
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              {item[0]} - {item[2]}
                            </Typography>
                            {item[1] && (
                              <Chip 
                                label={item[1]} 
                                size="small" 
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No hay actividad reciente" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráficos (placeholder) */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución por Estado
              </Typography>
              <Box height={300} display="flex" alignItems="center" justifyContent="center">
                <Typography color="textSecondary">
                  Gráficos disponibles próximamente
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 
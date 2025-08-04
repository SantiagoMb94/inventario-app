import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add,
  Edit,
  Search,
  Refresh,
  PersonAdd,
  FolderOpen,
  Send
} from '@mui/icons-material';

const Equipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    Estado: '',
    Marca: '',
    Propiedad: '',
    general: ''
  });

  useEffect(() => {
    loadEquipos();
  }, []);

  const loadEquipos = async () => {
    try {
      setLoading(true);
      
      // Datos de equipos de ejemplo basados en el sistema actual
      const mockEquipos = [
        {
          id: 1,
          serial: 'PF4L3QHY',
          nombre: 'ThinkPad',
          marca: 'Lenovo',
          propiedad: 'Third Way He...',
          estado: 'Asignado',
          piso: 'VIP',
          mac_lan: '74:5D:22:66:...',
          mac_wifi: 'BC:03:58:F1:...',
          agente: 'Juan Bohorq...',
          fecha_agregado: '2024-01-15',
          acta_firmada: 'Ver Acta'
        },
        {
          id: 2,
          serial: '5CD4520XS1',
          nombre: 'HP ProBook...',
          marca: 'HP',
          propiedad: 'PcCom - Equ...',
          estado: 'Asignado',
          piso: 'VIP',
          mac_lan: 'C4:C6:E6:1A:...',
          mac_wifi: 'C0:35:32:0F:...',
          agente: 'Maye Diaz N...',
          fecha_agregado: '2024-01-14',
          acta_firmada: 'Ver Acta'
        },
        {
          id: 3,
          serial: 'PF4NQ1XY',
          nombre: 'ThinkPad',
          marca: 'Lenovo',
          propiedad: 'Third Way He...',
          estado: 'Asignado',
          piso: 'VIP',
          mac_lan: 'A1:B2:C3:D4:...',
          mac_wifi: 'E5:F6:G7:H8:...',
          agente: 'Natalia Iregui',
          fecha_agregado: '2024-01-13',
          acta_firmada: 'Ver Acta'
        },
        {
          id: 4,
          serial: 'PF3PB9MQ',
          nombre: 'E41-55',
          marca: 'Lenovo',
          propiedad: 'PcCom - Equ...',
          estado: 'Asignado',
          piso: 'VIP',
          mac_lan: '1A:2B:3C:4D:...',
          mac_wifi: '5E:6F:7G:8H:...',
          agente: 'Cristian Davi...',
          fecha_agregado: '2024-01-12',
          acta_firmada: 'Ver Acta'
        },
        {
          id: 5,
          serial: 'PF4WW55L',
          nombre: 'ThinkPad',
          marca: 'Lenovo',
          propiedad: 'Third Way He...',
          estado: 'Stock',
          piso: '7',
          mac_lan: '9A:8B:7C:6D:...',
          mac_wifi: '5E:4F:3G:2H:...',
          agente: '',
          fecha_agregado: '2024-01-11',
          acta_firmada: 'No adjunta'
        }
      ];

      setEquipos(mockEquipos);
      
    } catch (err) {
      setError('Error al cargar equipos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Asignado': return 'success';
      case 'Stock': return 'primary';
      case 'En Reparación': return 'warning';
      case 'De Baja': return 'error';
      default: return 'default';
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

  return (
    <Box>
      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="end">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Location</InputLabel>
                <Select
                  value=""
                  onChange={() => {}}
                  label="Location"
                >
                  <MenuItem value="">Todas las Ubicaciones</MenuItem>
                  <MenuItem value="Stock">Stock</MenuItem>
                  <MenuItem value="VIP">VIP</MenuItem>
                  <MenuItem value="7">7</MenuItem>
                  <MenuItem value="10">10</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtros.Estado}
                  onChange={(e) => handleFilterChange('Estado', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">Todos los Estados</MenuItem>
                  <MenuItem value="Asignado">Asignado</MenuItem>
                  <MenuItem value="Stock">Stock</MenuItem>
                  <MenuItem value="En Reparación">En Reparación</MenuItem>
                  <MenuItem value="De Baja">De Baja</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Brand</InputLabel>
                <Select
                  value={filtros.Marca}
                  onChange={(e) => handleFilterChange('Marca', e.target.value)}
                  label="Brand"
                >
                  <MenuItem value="">Todas las Marcas</MenuItem>
                  <MenuItem value="Lenovo">Lenovo</MenuItem>
                  <MenuItem value="HP">HP</MenuItem>
                  <MenuItem value="Dell">Dell</MenuItem>
                  <MenuItem value="Apple">Apple</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Ownership</InputLabel>
                <Select
                  value={filtros.Propiedad}
                  onChange={(e) => handleFilterChange('Propiedad', e.target.value)}
                  label="Ownership"
                >
                  <MenuItem value="">Todas las Propiedades</MenuItem>
                  <MenuItem value="Third Way He...">Third Way He...</MenuItem>
                  <MenuItem value="PcCom - Equ...">PcCom - Equ...</MenuItem>
                  <MenuItem value="Propia">Propia</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="General Search"
                placeholder="Search by Serial, Name, Agent..."
                value={filtros.general}
                onChange={(e) => handleFilterChange('general', e.target.value)}
                InputProps={{
                  startAdornment: <Search />
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={1}>
              <IconButton onClick={loadEquipos}>
                <Refresh />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Header con botones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Equipment
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            sx={{ 
              background: 'linear-gradient(45deg, #059669, #10b981)',
              '&:hover': { background: 'linear-gradient(45deg, #047857, #059669)' }
            }}
          >
            + Assign Item
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ 
              background: 'linear-gradient(45deg, #1976d2, #1565c0)',
              '&:hover': { background: 'linear-gradient(45deg, #1565c0, #0d47a1)' }
            }}
          >
            + New Item
          </Button>
        </Box>
      </Box>

      {/* Tabla */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>SERIAL</strong></TableCell>
              <TableCell><strong>ITEM NAME</strong></TableCell>
              <TableCell><strong>BRAND</strong></TableCell>
              <TableCell><strong>OWNERSHIP</strong></TableCell>
              <TableCell><strong>DATE ADDED</strong></TableCell>
              <TableCell><strong>AGENT</strong></TableCell>
              <TableCell><strong>STATUS</strong></TableCell>
              <TableCell><strong>FLOOR</strong></TableCell>
              <TableCell><strong>MAC LAN</strong></TableCell>
              <TableCell><strong>MAC WIFI</strong></TableCell>
              <TableCell><strong>ACTA FIRMADA</strong></TableCell>
              <TableCell><strong>ACTIONS</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {equipos.map((equipo) => (
              <TableRow key={equipo.id} hover>
                <TableCell>{equipo.serial}</TableCell>
                <TableCell>{equipo.nombre}</TableCell>
                <TableCell>{equipo.marca}</TableCell>
                <TableCell>{equipo.propiedad}</TableCell>
                <TableCell>{equipo.fecha_agregado}</TableCell>
                <TableCell>{equipo.agente || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={equipo.estado}
                    color={getStatusColor(equipo.estado)}
                    size="small"
                    sx={{ 
                      backgroundColor: equipo.estado === 'Asignado' ? '#1976d2' : 
                                     equipo.estado === 'Stock' ? '#2196f3' :
                                     equipo.estado === 'En Reparación' ? '#ff9800' :
                                     equipo.estado === 'De Baja' ? '#f44336' : '#757575',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </TableCell>
                <TableCell>{equipo.piso}</TableCell>
                <TableCell style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {equipo.mac_lan}
                </TableCell>
                <TableCell style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {equipo.mac_wifi}
                </TableCell>
                <TableCell>
                  {equipo.acta_firmada === 'Ver Acta' ? (
                    <Button
                      size="small"
                      color="primary"
                      sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      Ver Acta
                    </Button>
                  ) : (
                    <span style={{ color: '#666', fontSize: '0.8rem' }}>No adjunta</span>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    sx={{ color: '#1976d2' }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{ color: '#666' }}
                  >
                    <FolderOpen />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{ color: '#666' }}
                  >
                    <Send />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Equipos; 
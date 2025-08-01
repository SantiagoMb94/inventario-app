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
  TablePagination,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  FilterList,
  Refresh,
  Assignment,
  Warehouse
} from '@mui/icons-material';

const Equipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    Estado: '',
    Marca: '',
    Propiedad: '',
    general: ''
  });
  const [hoja, setHoja] = useState('Stock');
  
  // Configuración
  const [config, setConfig] = useState({});
  
  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState(null);
  const [formData, setFormData] = useState({
    serial: '',
    nombre: '',
    marca: '',
    modelo: '',
    tipo: '',
    propiedad: '',
    estado: 'Stock',
    piso: '',
    mac_lan: '',
    mac_wifi: '',
    ubicacion: 'Stock',
    agente: ''
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadConfig();
    loadEquipos();
  }, [page, rowsPerPage, filtros, hoja]);

  const loadConfig = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/inventario/config/lists`);
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      console.error('Error cargando configuración:', err);
    }
  };

  const loadEquipos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        pagina: page + 1,
        itemsPorPagina: rowsPerPage,
        hoja: hoja,
        ...filtros
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/inventario/equipos?${params}`);
      const data = await response.json();
      
      setEquipos(data.datos);
      setTotalItems(data.totalItems);
      setTotalPages(data.totalPaginas);
    } catch (err) {
      setError('Error al cargar equipos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleHojaChange = (event) => {
    setHoja(event.target.value);
    setPage(0);
  };

  const handleOpenModal = (equipo = null) => {
    if (equipo) {
      setEditingEquipo(equipo);
      setFormData(equipo);
    } else {
      setEditingEquipo(null);
      setFormData({
        serial: '',
        nombre: '',
        marca: '',
        modelo: '',
        tipo: '',
        propiedad: '',
        estado: 'Stock',
        piso: '',
        mac_lan: '',
        mac_wifi: '',
        ubicacion: 'Stock',
        agente: ''
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingEquipo(null);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const url = editingEquipo 
        ? `${process.env.REACT_APP_API_URL}/api/inventario/equipos/${editingEquipo.id}`
        : `${process.env.REACT_APP_API_URL}/api/inventario/equipos`;
      
      const method = editingEquipo ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: editingEquipo ? 'Equipo actualizado correctamente' : 'Equipo creado correctamente',
          severity: 'success'
        });
        handleCloseModal();
        loadEquipos();
      } else {
        throw new Error('Error en la operación');
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Error al guardar equipo',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este equipo?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/inventario/equipos/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setSnackbar({
            open: true,
            message: 'Equipo eliminado correctamente',
            severity: 'success'
          });
          loadEquipos();
        } else {
          throw new Error('Error al eliminar');
        }
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Error al eliminar equipo',
          severity: 'error'
        });
      }
    }
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

  if (loading && equipos.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Equipos
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenModal()}
        >
          Nuevo Equipo
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Ubicación</InputLabel>
                <Select
                  value={hoja}
                  onChange={handleHojaChange}
                  label="Ubicación"
                >
                  <MenuItem value="All Locations">Todas las ubicaciones</MenuItem>
                  {config.ubicaciones?.map(ubicacion => (
                    <MenuItem key={ubicacion} value={ubicacion}>
                      {ubicacion}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filtros.Estado}
                  onChange={(e) => handleFilterChange('Estado', e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {config.estados?.map(estado => (
                    <MenuItem key={estado} value={estado}>
                      {estado}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Marca</InputLabel>
                <Select
                  value={filtros.Marca}
                  onChange={(e) => handleFilterChange('Marca', e.target.value)}
                  label="Marca"
                >
                  <MenuItem value="">Todas</MenuItem>
                  {config.marcas?.map(marca => (
                    <MenuItem key={marca} value={marca}>
                      {marca}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Propiedad</InputLabel>
                <Select
                  value={filtros.Propiedad}
                  onChange={(e) => handleFilterChange('Propiedad', e.target.value)}
                  label="Propiedad"
                >
                  <MenuItem value="">Todas</MenuItem>
                  {config.propiedades?.map(propiedad => (
                    <MenuItem key={propiedad} value={propiedad}>
                      {propiedad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Buscar (Serial, Nombre, Agente)"
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

      {/* Tabla */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Serial</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Agente</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {equipos.map((equipo) => (
              <TableRow key={equipo.id}>
                <TableCell>{equipo.serial || 'N/A'}</TableCell>
                <TableCell>{equipo.nombre}</TableCell>
                <TableCell>{equipo.marca}</TableCell>
                <TableCell>{equipo.modelo}</TableCell>
                <TableCell>
                  <Chip
                    label={equipo.estado}
                    color={getStatusColor(equipo.estado)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{equipo.agente || 'N/A'}</TableCell>
                <TableCell>{equipo.ubicacion}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenModal(equipo)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(equipo.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </TableContainer>

      {/* Modal de Equipo */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEquipo ? 'Editar Equipo' : 'Nuevo Equipo'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Serial"
                value={formData.serial}
                onChange={(e) => handleFormChange('serial', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.nombre}
                onChange={(e) => handleFormChange('nombre', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Marca"
                value={formData.marca}
                onChange={(e) => handleFormChange('marca', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Modelo"
                value={formData.modelo}
                onChange={(e) => handleFormChange('modelo', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tipo"
                value={formData.tipo}
                onChange={(e) => handleFormChange('tipo', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Propiedad</InputLabel>
                <Select
                  value={formData.propiedad}
                  onChange={(e) => handleFormChange('propiedad', e.target.value)}
                  label="Propiedad"
                >
                  {config.propiedades?.map(propiedad => (
                    <MenuItem key={propiedad} value={propiedad}>
                      {propiedad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado}
                  onChange={(e) => handleFormChange('estado', e.target.value)}
                  label="Estado"
                >
                  {config.estados?.map(estado => (
                    <MenuItem key={estado} value={estado}>
                      {estado}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Piso</InputLabel>
                <Select
                  value={formData.piso}
                  onChange={(e) => handleFormChange('piso', e.target.value)}
                  label="Piso"
                >
                  {config.pisos?.map(piso => (
                    <MenuItem key={piso} value={piso}>
                      {piso}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="MAC LAN"
                value={formData.mac_lan}
                onChange={(e) => handleFormChange('mac_lan', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="MAC WiFi"
                value={formData.mac_wifi}
                onChange={(e) => handleFormChange('mac_wifi', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Ubicación</InputLabel>
                <Select
                  value={formData.ubicacion}
                  onChange={(e) => handleFormChange('ubicacion', e.target.value)}
                  label="Ubicación"
                >
                  {config.ubicaciones?.map(ubicacion => (
                    <MenuItem key={ubicacion} value={ubicacion}>
                      {ubicacion}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Agente"
                value={formData.agente}
                onChange={(e) => handleFormChange('agente', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingEquipo ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Equipos; 
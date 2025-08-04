import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add,
  Edit,
  Delete
} from '@mui/icons-material';

const Configuracion = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [configData, setConfigData] = useState({
    estados: ['Asignado', 'De baja', 'Disponible', 'En Reparación', 'Stock'],
    pisos: ['7', '10', '12', '16', 'VIP'],
    marcas: ['Acer', 'Apple', 'Dell', 'HP', 'Lenovo']
  });

  useEffect(() => {
    loadConfigData();
  }, []);

  const loadConfigData = async () => {
    try {
      setLoading(true);
      // Simular carga de datos
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Error al cargar configuración');
      console.error('Error:', err);
    }
  };

  const handleAddItem = (listName) => {
    const newValue = prompt(`Agregar nuevo ${listName.toLowerCase()}:`);
    if (newValue && newValue.trim()) {
      setConfigData(prev => ({
        ...prev,
        [listName.toLowerCase()]: [...prev[listName.toLowerCase()], newValue.trim()]
      }));
    }
  };

  const handleDeleteItem = (listName, itemValue) => {
    if (window.confirm(`¿Está seguro de que desea eliminar "${itemValue}"?`)) {
      setConfigData(prev => ({
        ...prev,
        [listName.toLowerCase()]: prev[listName.toLowerCase()].filter(item => item !== itemValue)
      }));
    }
  };

  const handleEditItem = (listName, oldValue) => {
    if (listName === 'Pisos') {
      const newValue = prompt(`Editar nombre del piso:\n(No incluyas la palabra "Piso")`, oldValue);
      if (newValue && newValue.trim() && newValue !== oldValue) {
        setConfigData(prev => ({
          ...prev,
          [listName.toLowerCase()]: prev[listName.toLowerCase()].map(item => 
            item === oldValue ? newValue.trim() : item
          )
        }));
      }
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

  const configSections = [
    { name: 'Estados', key: 'estados', title: 'Estados' },
    { name: 'Pisos', key: 'pisos', title: 'Pisos' },
    { name: 'Marcas', key: 'marcas', title: 'Marcas' }
  ];

  return (
    <Box>
      <Grid container spacing={3}>
        {configSections.map((section) => (
          <Grid item xs={12} md={4} key={section.key}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: '#557cf8',
                  paddingBottom: '15px',
                  borderBottom: '1px solid rgba(85, 124, 248, 0.2)',
                  marginBottom: '15px',
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}>
                  Gestionar {section.title}
                </Typography>
                
                <List sx={{ padding: 0 }}>
                  {configData[section.key].map((item, index) => (
                    <ListItem 
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        margin: '0 -1rem',
                        borderBottom: '1px solid rgba(85, 124, 248, 0.2)',
                        transition: 'background-color 0.2s',
                        borderRadius: '6px',
                        '&:last-child': {
                          borderBottom: 'none'
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)'
                        }
                      }}
                    >
                      <ListItemText primary={item} />
                      <Box sx={{ display: 'flex', gap: '0.5rem' }}>
                        {section.name === 'Pisos' && (
                          <IconButton
                            size="small"
                            onClick={() => handleEditItem(section.name, item)}
                            sx={{ 
                              color: '#38bdf8',
                              '&:hover': { backgroundColor: 'rgba(56, 189, 248, 0.1)' }
                            }}
                          >
                            <Edit />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteItem(section.name, item)}
                          sx={{ 
                            color: '#f472b6',
                            '&:hover': { backgroundColor: 'rgba(244, 114, 182, 0.1)' }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ 
                  display: 'flex', 
                  gap: '0.75rem', 
                  marginTop: '1.5rem' 
                }}>
                  <TextField
                    size="small"
                    placeholder="Nuevo valor..."
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleAddItem(section.name)}
                    sx={{ 
                      flexShrink: 0,
                      padding: '10px 15px',
                      background: 'linear-gradient(45deg, #557cf8, #3a506b)',
                      '&:hover': { background: 'linear-gradient(45deg, #3a506b, #557cf8)' }
                    }}
                  >
                    <Add />
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Configuracion; 
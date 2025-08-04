import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Assessment,
  FileDownload
} from '@mui/icons-material';

const Reportes = () => {
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  const filterOptions = [
    { value: 'Estado', label: 'Status' },
    { value: 'Marca', label: 'Brand' },
    { value: 'Piso', label: 'Floor' },
    { value: 'Propiedad', label: 'Ownership' }
  ];

  const filterValues = {
    Estado: ['Asignado', 'Stock', 'En Reparación', 'De Baja', 'Disponible'],
    Marca: ['Lenovo', 'HP', 'Dell', 'Apple', 'Acer'],
    Piso: ['7', '10', '12', '16', 'VIP'],
    Propiedad: ['Third Way He...', 'PcCom - Equ...', 'Propia']
  };

  const generateReport = async () => {
    if (!filterType || !filterValue) {
      setError('Please select both filter type and value');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simular generación de reporte
      setTimeout(() => {
        const mockReportData = {
          stats: {
            total: 25,
            asignado: 15,
            stock: 5,
            disponible: 3,
            reparacion: 2
          },
          results: [
            {
              serial: 'PF4L3QHY',
              nombre: 'ThinkPad',
              marca: 'Lenovo',
              estado: 'Asignado',
              piso: 'VIP',
              agente: 'Juan Bohorq...',
              fecha_agregado: '2024-01-15'
            },
            {
              serial: '5CD4520XS1',
              nombre: 'HP ProBook...',
              marca: 'HP',
              estado: 'Asignado',
              piso: 'VIP',
              agente: 'Maye Diaz N...',
              fecha_agregado: '2024-01-14'
            }
          ]
        };
        setReportData(mockReportData);
        setLoading(false);
      }, 2000);
    } catch (err) {
      setError('Error generating report');
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;
    
    const headers = ['Serial', 'Item Name', 'Brand', 'Status', 'Floor', 'Agent', 'Date Added'];
    const csvContent = [
      headers.join(','),
      ...reportData.results.map(item => [
        item.serial,
        item.nombre,
        item.marca,
        item.estado,
        item.piso,
        item.agente,
        item.fecha_agregado
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${filterType}_${filterValue}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box>
      {/* Report Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ 
            color: '#557cf8',
            paddingBottom: '15px',
            borderBottom: '1px solid rgba(85, 124, 248, 0.2)',
            marginBottom: '15px',
            fontSize: '1.1rem',
            fontWeight: 600
          }}>
            Create New Report
          </Typography>
          
          <Grid container spacing={2} alignItems="end">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by:</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setFilterValue('');
                  }}
                  label="Filter by:"
                >
                  {filterOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {filterType && (
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Value:</InputLabel>
                  <Select
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    label="Value:"
                  >
                    {filterValues[filterType]?.map(value => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                startIcon={<Assessment />}
                onClick={generateReport}
                disabled={!filterType || !filterValue || loading}
                fullWidth
                sx={{ 
                  background: 'linear-gradient(45deg, #557cf8, #3a506b)',
                  '&:hover': { background: 'linear-gradient(45deg, #3a506b, #557cf8)' }
                }}
              >
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Report Results */}
      {reportData && !loading && (
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            Report Results
          </Typography>

          {/* KPI Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {reportData.stats.total}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Items
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {reportData.stats.asignado}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Assigned
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {reportData.stats.stock}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    In Stock
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {reportData.stats.disponible}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Available
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {reportData.stats.reparacion}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    In Repair
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Results Table */}
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Items Found
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<FileDownload />}
                  onClick={exportToCSV}
                  sx={{ 
                    background: 'linear-gradient(45deg, #10b981, #2dd4bf)',
                    '&:hover': { background: 'linear-gradient(45deg, #059669, #10b981)' }
                  }}
                >
                  Export to CSV
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>SERIAL</strong></TableCell>
                      <TableCell><strong>ITEM NAME</strong></TableCell>
                      <TableCell><strong>BRAND</strong></TableCell>
                      <TableCell><strong>STATUS</strong></TableCell>
                      <TableCell><strong>FLOOR</strong></TableCell>
                      <TableCell><strong>AGENT</strong></TableCell>
                      <TableCell><strong>DATE ADDED</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.results.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{item.serial}</TableCell>
                        <TableCell>{item.nombre}</TableCell>
                        <TableCell>{item.marca}</TableCell>
                        <TableCell>{item.estado}</TableCell>
                        <TableCell>{item.piso}</TableCell>
                        <TableCell>{item.agente}</TableCell>
                        <TableCell>{item.fecha_agregado}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default Reportes; 
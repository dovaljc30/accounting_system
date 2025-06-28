import axios from 'axios';

// Usar variable de entorno o valor por defecto
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Servicios para Terceros
export const tercerosService = {
  getAll: () => api.get('/terceros'),
  getById: (id) => api.get(`/terceros/${id}`),
  create: (tercero) => api.post('/terceros', tercero),
  update: (id, tercero) => api.put(`/terceros/${id}`, tercero),
  delete: (id) => api.delete(`/terceros/${id}`),
};

// Servicios para Cuentas Contables
export const cuentasService = {
  getAll: () => api.get('/cuentas'),
  getById: (id) => api.get(`/cuentas/${id}`),
  create: (cuenta) => api.post('/cuentas', cuenta),
  update: (id, cuenta) => api.put(`/cuentas/${id}`, cuenta),
  delete: (id) => api.delete(`/cuentas/${id}`),
  toggleActivo: (id) => api.patch(`/cuentas/${id}/toggle-activo`),
  getActivas: () => api.get('/cuentas/activas'),
  testConnection: () => api.get('/test')
};

// Servicios para Transacciones
export const transaccionesService = {
  getAll: () => api.get('/transacciones'),
  getById: (id) => api.get(`/transacciones/${id}`),
  create: async (transaccion) => {
    console.log('🚀 Enviando POST a /transacciones');
    const response = await api.post('/transacciones', transaccion);
    console.log('📥 Respuesta del servidor:', response);
    return response;
  },
  update: (id, transaccion) => api.put(`/transacciones/${id}`, transaccion),
  delete: (id) => api.delete(`/transacciones/${id}`),
  getByFiltros: (filtros) => {
    // Solo incluir parámetros que tengan valor
    const params = {};
    if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
    if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;
    if (filtros.terceroId) params.terceroId = filtros.terceroId;
    
    return api.get('/transacciones', { params });
  },
};

// Servicios para Saldos
export const saldosService = {
  getSaldos: () => api.get('/saldos'),
  getSaldoByCuenta: (cuentaId) => api.get(`/saldos/cuenta/${cuentaId}`),
};

export default api; 
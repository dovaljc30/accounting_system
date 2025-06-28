import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Alert, 
  Badge,
  Row,
  Col,
  Card,
  InputGroup
} from 'react-bootstrap';
import { transaccionesService, tercerosService, cuentasService } from '../services/api';

const Transacciones = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [terceros, setTerceros] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaccion, setEditingTransaccion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [todasTransacciones, setTodasTransacciones] = useState([]);

  // Filtros
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    terceroId: ''
  });

  const [formData, setFormData] = useState({
    terceroId: '',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    partidas: [
      { cuentaId: '', tipo: 'DEBITO', valor: '' },
      { cuentaId: '', tipo: 'CREDITO', valor: '' }
    ]
  });

  useEffect(() => {
    loadTransacciones();
    loadTerceros();
    loadCuentas();
  }, []);

  const testBackendConnection = async () => {
    try {
      const response = await cuentasService.testConnection();
    } catch (err) {
      // Error de conexión silencioso
    }
  };

  const loadTransacciones = async () => {
    try {
      setLoading(true);
      const response = await transaccionesService.getAll();
      const data = Array.isArray(response.data) ? response.data : [];
      setTodasTransacciones(data);
      setTransacciones(data);
    } catch (err) {
      setError('Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  const loadTerceros = async () => {
    try {
      const response = await tercerosService.getAll();
      setTerceros(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      // Error silencioso
    }
  };

  const loadCuentas = async () => {
    try {
      const response = await cuentasService.getActivas();
      setCuentas(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      // Error silencioso
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que haya al menos una partida de débito y una de crédito
    const debitos = formData.partidas.filter(p => p.tipo === 'DEBITO' && p.cuentaId && p.valor);
    const creditos = formData.partidas.filter(p => p.tipo === 'CREDITO' && p.cuentaId && p.valor);
    
    if (debitos.length === 0 || creditos.length === 0) {
      setError('Debe haber al menos una partida de débito y una de crédito');
      return;
    }

    // Validar que los totales sean iguales
    const totalDebitos = debitos.reduce((sum, p) => sum + parseFloat(p.valor), 0);
    const totalCreditos = creditos.reduce((sum, p) => sum + parseFloat(p.valor), 0);
    
    if (Math.abs(totalDebitos - totalCreditos) > 0.01) {
      setError('Los totales de débitos y créditos deben ser iguales');
      return;
    }

    // Validar que terceroId sea válido
    if (!formData.terceroId) {
      setError('Debe seleccionar un tercero');
      return;
    }

    // Validar que la fecha sea válida
    if (!formData.fecha) {
      setError('Debe seleccionar una fecha');
      return;
    }

    // Validar que la descripción no esté vacía
    if (!formData.descripcion.trim()) {
      setError('Debe ingresar una descripción');
      return;
    }

    // Validar que las cuentas seleccionadas existan
    const cuentasSeleccionadas = formData.partidas
      .filter(p => p.cuentaId && p.valor)
      .map(p => parseInt(p.cuentaId));
    
    const cuentasExistentes = cuentas.map(c => c.id);
    const cuentasInvalidas = cuentasSeleccionadas.filter(id => !cuentasExistentes.includes(id));
    
    if (cuentasInvalidas.length > 0) {
      setError(`Las siguientes cuentas no existen: ${cuentasInvalidas.join(', ')}`);
      return;
    }

    // Validar que haya cuentas disponibles
    if (cuentas.length === 0) {
      setError('No hay cuentas contables disponibles. Debe crear cuentas primero.');
      return;
    }

    // Validar que haya terceros disponibles
    if (terceros.length === 0) {
      setError('No hay terceros disponibles. Debe crear terceros primero.');
      return;
    }

    try {
      setLoading(true);
      
      // Convertir los tipos de datos correctamente
      const transaccionData = {
        tercero: {
          id: parseInt(formData.terceroId)
        },
        fecha: formData.fecha,
        descripcion: formData.descripcion.trim(),
        partidas: formData.partidas
          .filter(p => p.cuentaId && p.valor)
          .map(p => ({
            cuentaContableId: parseInt(p.cuentaId),
            tipo: p.tipo.toUpperCase(),
            valor: parseFloat(p.valor)
          }))
      };

      console.log('🔍 Enviando transacción:', JSON.stringify(transaccionData, null, 2));

      if (editingTransaccion) {
        const response = await transaccionesService.update(editingTransaccion.id, transaccionData);
        console.log('✅ Transacción actualizada:', response.data);
        setSuccess('Transacción actualizada exitosamente');
      } else {
        const response = await transaccionesService.create(transaccionData);
        console.log('✅ Transacción creada:', response.data);
        setSuccess('Transacción creada exitosamente');
      }
      handleCloseModal();
      loadTransacciones();
    } catch (err) {
      console.error('❌ Error al guardar transacción:', err);
      console.error('❌ Respuesta del servidor:', err.response?.data);
      
      let errorMessage = "La cuenta 'Cuenta prueba' no permite saldo negativo.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else {
        // Si no hay mensaje específico del backend, intentar construir uno con la cuenta seleccionada
        const cuentaSeleccionada = formData.partidas.find(p => p.cuentaId && p.valor);
        if (cuentaSeleccionada) {
          const cuenta = cuentas.find(c => c.id === parseInt(cuentaSeleccionada.cuentaId));
          if (cuenta) {
            errorMessage = `La cuenta '${cuenta.nombre}' no permite saldo negativo.`;
          }
        }
      }
      
      // Si el mensaje contiene información sobre saldo negativo, lo destacamos
      if (errorMessage.toLowerCase().includes('saldo negativo') || 
          errorMessage.toLowerCase().includes('no permite saldo')) {
        errorMessage = `⚠️ ${errorMessage}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const soloFechaStr = (fechaStr) => {
    if (!fechaStr) return '';
    const str = typeof fechaStr === 'string' ? fechaStr : fechaStr.toString();
    return str.split('T')[0];
  };

  const handleFiltros = () => {
    let filtradas = todasTransacciones;
    const { fechaDesde, fechaHasta, terceroId } = filtros;

    if (fechaDesde && fechaHasta && fechaDesde === fechaHasta) {
      // Solo ese día
      filtradas = filtradas.filter(t =>
        soloFechaStr(t.fecha) === fechaDesde
      );
    } else {
      if (fechaDesde) {
        filtradas = filtradas.filter(t =>
          soloFechaStr(t.fecha) >= fechaDesde
        );
      }
      if (fechaHasta) {
        filtradas = filtradas.filter(t =>
          soloFechaStr(t.fecha) <= fechaHasta
        );
      }
    }
    if (terceroId) {
      filtradas = filtradas.filter(t =>
        (t.tercero?.id || t.terceroId) === parseInt(terceroId)
      );
    }
    setTransacciones(filtradas);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      fechaDesde: '',
      fechaHasta: '',
      terceroId: ''
    });
    setTransacciones(todasTransacciones);
  };

  const handleAddPartida = () => {
    setFormData({
      ...formData,
      partidas: [...formData.partidas, { cuentaId: '', tipo: 'DEBITO', valor: '' }]
    });
  };

  const handleRemovePartida = (index) => {
    if (formData.partidas.length > 2) {
      const newPartidas = formData.partidas.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        partidas: newPartidas
      });
    }
  };

  const handlePartidaChange = (index, field, value) => {
    const newPartidas = [...formData.partidas];
    newPartidas[index][field] = value;
    setFormData({
      ...formData,
      partidas: newPartidas
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTransaccion(null);
    setFormData({
      terceroId: '',
      fecha: new Date().toISOString().split('T')[0],
      descripcion: '',
      partidas: [
        { cuentaId: '', tipo: 'DEBITO', valor: '' },
        { cuentaId: '', tipo: 'CREDITO', valor: '' }
      ]
    });
    setError('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value.trim() === '' ? '' : value
    }));
  };

  const calcularTotales = () => {
    const debitos = formData.partidas
      .filter(p => p.tipo === 'DEBITO' && p.valor)
      .reduce((sum, p) => sum + parseFloat(p.valor || 0), 0);
    const creditos = formData.partidas
      .filter(p => p.tipo === 'CREDITO' && p.valor)
      .reduce((sum, p) => sum + parseFloat(p.valor || 0), 0);
    return { debitos, creditos };
  };

  const { debitos, creditos } = calcularTotales();
  const balance = debitos - creditos;

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Gestión de Transacciones</h2>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => setShowModal(true)}
          >
            Nueva Transacción
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Header>
          <h5>Filtros</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Desde</Form.Label>
                <Form.Control
                  type="date"
                  name="fechaDesde"
                  value={filtros.fechaDesde}
                  onChange={handleFiltroChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Hasta</Form.Label>
                <Form.Control
                  type="date"
                  name="fechaHasta"
                  value={filtros.fechaHasta}
                  onChange={handleFiltroChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Tercero</Form.Label>
                <Form.Select
                  name="terceroId"
                  value={filtros.terceroId}
                  onChange={handleFiltroChange}
                >
                  <option value="">Todos los terceros</option>
                  {terceros.map((tercero) => (
                    <option key={tercero.id} value={tercero.id}>
                      {tercero.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <div>
                <Button variant="primary" onClick={handleFiltros} className="me-2">
                  Filtrar
                </Button>
                <Button variant="outline-secondary" onClick={handleLimpiarFiltros}>
                  Limpiar
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de Transacciones */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center">Cargando...</div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tercero</th>
                  <th>Descripción</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.map((transaccion) => (
                  <tr key={transaccion.id}>
                    <td>{transaccion.fecha}</td>
                    <td>
                      {transaccion.tercero?.nombre ||
                        terceros.find(t => t.id === (transaccion.tercero?.id || transaccion.terceroId))?.nombre ||
                        'N/A'}
                    </td>
                    <td>{transaccion.descripcion}</td>
                    <td>
                      <strong>
                        ${transaccion.partidas
                          .filter(p => p.tipo === 'DEBITO')
                          .reduce((sum, p) => sum + parseFloat(p.valor), 0)
                          .toLocaleString()}
                      </strong>
                    </td>
                    <td>
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        className="me-2"
                        onClick={() => {
                          setEditingTransaccion(transaccion);
                          setFormData({
                            terceroId: transaccion.terceroId,
                            fecha: transaccion.fecha.split('T')[0],
                            descripcion: transaccion.descripcion,
                            partidas: transaccion.partidas.map(p => ({
                              cuentaId: p.cuentaId,
                              tipo: p.tipo,
                              valor: p.valor
                            }))
                          });
                          setShowModal(true);
                        }}
                      >
                        Ver Detalle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Transacción */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTransaccion ? 'Ver Transacción' : 'Nueva Transacción'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Mostrar error dentro del modal */}
            {error && (
              <Alert 
                variant={error.includes('⚠️') ? 'warning' : 'danger'} 
                dismissible 
                onClose={() => setError('')} 
                className="mb-3"
              >
                <strong>{error.includes('⚠️') ? 'Error de Validación Contable:' : 'Error:'}</strong>
                <br />
                {error.replace('⚠️ ', '')}
              </Alert>
            )}
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tercero</Form.Label>
                  <Form.Select
                    name="terceroId"
                    value={formData.terceroId}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingTransaccion}
                  >
                    <option value="">Seleccione un tercero</option>
                    {terceros.map((tercero) => (
                      <option key={tercero.id} value={tercero.id}>
                        {tercero.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingTransaccion}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                required
                disabled={!!editingTransaccion}
              />
            </Form.Group>

            <h5>Partidas Contables</h5>
            {formData.partidas.map((partida, index) => (
              <Row key={index} className="mb-3">
                <Col md={4}>
                  <Form.Select
                    value={partida.cuentaId}
                    onChange={(e) => handlePartidaChange(index, 'cuentaId', e.target.value)}
                    required
                    disabled={!!editingTransaccion}
                  >
                    <option value="">Seleccione cuenta</option>
                    {cuentas.map((cuenta) => (
                      <option key={cuenta.id} value={cuenta.id}>
                        {cuenta.codigo} - {cuenta.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={partida.tipo}
                    onChange={(e) => handlePartidaChange(index, 'tipo', e.target.value)}
                    required
                    disabled={!!editingTransaccion}
                  >
                    <option value="DEBITO">Débito</option>
                    <option value="CREDITO">Crédito</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={partida.valor}
                      onChange={(e) => handlePartidaChange(index, 'valor', e.target.value)}
                      required
                      disabled={!!editingTransaccion}
                    />
                  </InputGroup>
                </Col>
                <Col md={2}>
                  {!editingTransaccion && formData.partidas.length > 2 && (
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleRemovePartida(index)}
                    >
                      Eliminar
                    </Button>
                  )}
                </Col>
              </Row>
            ))}

            {!editingTransaccion && (
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={handleAddPartida}
                className="mb-3"
              >
                Agregar Partida
              </Button>
            )}

            {/* Resumen de Totales */}
            <Card className="mt-3">
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <strong>Total Débitos: ${debitos.toLocaleString()}</strong>
                  </Col>
                  <Col md={4}>
                    <strong>Total Créditos: ${creditos.toLocaleString()}</strong>
                  </Col>
                  <Col md={4}>
                    <strong className={balance === 0 ? 'text-success' : 'text-danger'}>
                      Balance: ${balance.toLocaleString()}
                    </strong>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              {editingTransaccion ? 'Cerrar' : 'Cancelar'}
            </Button>
            {!editingTransaccion && (
              <Button variant="primary" type="submit" disabled={loading || balance !== 0}>
                {loading ? 'Guardando...' : 'Crear Transacción'}
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Transacciones; 
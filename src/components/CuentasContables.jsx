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
  Card
} from 'react-bootstrap';
import { cuentasService } from '../services/api';

const CuentasContables = () => {
  const [cuentas, setCuentas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipo: 'ACTIVO',
    permiteSaldoNegativo: false,
    activo: true
  });

  const tiposCuenta = [
    { value: 'ACTIVO', label: 'Activo' },
    { value: 'PASIVO', label: 'Pasivo' },
    { value: 'PATRIMONIO', label: 'Patrimonio' },
    { value: 'INGRESO', label: 'Ingreso' },
    { value: 'GASTO', label: 'Gasto' }
  ];

  useEffect(() => {
    loadCuentas();
  }, []);

  const loadCuentas = async () => {
    try {
      setLoading(true);
      const response = await cuentasService.getAll();
      setCuentas(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Error al cargar las cuentas contables');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingCuenta) {
        await cuentasService.update(editingCuenta.id, formData);
        setSuccess('Cuenta contable actualizada exitosamente');
      } else {
        await cuentasService.create(formData);
        setSuccess('Cuenta contable creada exitosamente');
      }
      handleCloseModal();
      loadCuentas();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la cuenta contable');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cuenta) => {
    setEditingCuenta(cuenta);
    setFormData({
      codigo: cuenta.codigo,
      nombre: cuenta.nombre,
      tipo: cuenta.tipo,
      permiteSaldoNegativo: cuenta.permiteSaldoNegativo,
      activo: cuenta.activo
    });
    setShowModal(true);
  };

  const handleToggleActivo = async (id) => {
    try {
      await cuentasService.toggleActivo(id);
      setSuccess('Estado de la cuenta actualizado exitosamente');
      loadCuentas();
    } catch (err) {
      setError('Error al cambiar el estado de la cuenta');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta cuenta contable?')) {
      try {
        await cuentasService.delete(id);
        setSuccess('Cuenta contable eliminada exitosamente');
        loadCuentas();
      } catch (err) {
        setError('Error al eliminar la cuenta contable');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCuenta(null);
    setFormData({
      codigo: '',
      nombre: '',
      tipo: 'ACTIVO',
      permiteSaldoNegativo: false,
      activo: true
    });
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const getTipoColor = (tipo) => {
    const colors = {
      'ACTIVO': 'success',
      'PASIVO': 'danger',
      'PATRIMONIO': 'primary',
      'INGRESO': 'info',
      'GASTO': 'warning'
    };
    return colors[tipo] || 'secondary';
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Gestión de Cuentas Contables</h2>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => setShowModal(true)}
          >
            Nueva Cuenta
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center">Cargando...</div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Permite Saldo Negativo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cuentas.map((cuenta) => (
                  <tr key={cuenta.id}>
                    <td>{cuenta.id}</td>
                    <td><strong>{cuenta.codigo}</strong></td>
                    <td>{cuenta.nombre}</td>
                    <td>
                      <Badge bg={getTipoColor(cuenta.tipo)}>
                        {tiposCuenta.find(t => t.value === cuenta.tipo)?.label || cuenta.tipo}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={cuenta.permiteSaldoNegativo ? 'warning' : 'success'}>
                        {cuenta.permiteSaldoNegativo ? 'Sí' : 'No'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={cuenta.activo ? 'success' : 'danger'}>
                        {cuenta.activo ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleEdit(cuenta)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant={cuenta.activo ? "outline-warning" : "outline-success"}
                        size="sm" 
                        className="me-2"
                        onClick={() => handleToggleActivo(cuenta.id)}
                      >
                        {cuenta.activo ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDelete(cuenta.id)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCuenta ? 'Editar Cuenta Contable' : 'Nueva Cuenta Contable'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Código</Form.Label>
                  <Form.Control
                    type="text"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: 1105"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Cuenta</Form.Label>
                  <Form.Select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                  >
                    {tiposCuenta.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                placeholder="Ej: Caja"
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="permiteSaldoNegativo"
                    checked={formData.permiteSaldoNegativo}
                    onChange={handleInputChange}
                    label="Permite saldo negativo"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleInputChange}
                    label="Cuenta activa"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (editingCuenta ? 'Actualizar' : 'Crear')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default CuentasContables; 
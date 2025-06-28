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
import { tercerosService } from '../services/api';

const Terceros = () => {
  const [terceros, setTerceros] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTercero, setEditingTercero] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    tipoDocumento: 'CC',
    numeroDocumento: ''
  });

  const tiposDocumento = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'NIT', label: 'NIT' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'PP', label: 'Pasaporte' }
  ];

  useEffect(() => {
    loadTerceros();
  }, []);

  const loadTerceros = async () => {
    try {
      setLoading(true);
      const response = await tercerosService.getAll();
      setTerceros(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Error al cargar los terceros');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingTercero) {
        await tercerosService.update(editingTercero.id, formData);
        setSuccess('Tercero actualizado exitosamente');
      } else {
        await tercerosService.create(formData);
        setSuccess('Tercero creado exitosamente');
      }
      handleCloseModal();
      loadTerceros();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el tercero');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tercero) => {
    setEditingTercero(tercero);
    setFormData({
      nombre: tercero.nombre,
      tipoDocumento: tercero.tipoDocumento,
      numeroDocumento: tercero.numeroDocumento
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este tercero?')) {
      try {
        await tercerosService.delete(id);
        setSuccess('Tercero eliminado exitosamente');
        loadTerceros();
      } catch (err) {
        setError('Error al eliminar el tercero');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTercero(null);
    setFormData({
      nombre: '',
      tipoDocumento: 'CC',
      numeroDocumento: ''
    });
    setError('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Gestión de Terceros</h2>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => setShowModal(true)}
          >
            Nuevo Tercero
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
                  <th>Nombre</th>
                  <th>Tipo Documento</th>
                  <th>Número Documento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {terceros.map((tercero) => (
                  <tr key={tercero.id}>
                    <td>{tercero.id}</td>
                    <td>{tercero.nombre}</td>
                    <td>
                      <Badge bg="info">
                        {tiposDocumento.find(t => t.value === tercero.tipoDocumento)?.label || tercero.tipoDocumento}
                      </Badge>
                    </td>
                    <td>{tercero.numeroDocumento}</td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleEdit(tercero)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDelete(tercero.id)}
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
            {editingTercero ? 'Editar Tercero' : 'Nuevo Tercero'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Documento</Form.Label>
              <Form.Select
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleInputChange}
                required
              >
                {tiposDocumento.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Número de Documento</Form.Label>
              <Form.Control
                type="text"
                name="numeroDocumento"
                value={formData.numeroDocumento}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (editingTercero ? 'Actualizar' : 'Crear')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Terceros; 
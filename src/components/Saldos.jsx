import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Table, 
  Card, 
  Alert, 
  Badge,
  Row,
  Col,
  Form
} from 'react-bootstrap';
import { saldosService } from '../services/api';

const Saldos = () => {
  const [saldos, setSaldos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  useEffect(() => {
    loadSaldos();
  }, []);

  const loadSaldos = async () => {
    try {
      setLoading(true);
      const response = await saldosService.getSaldos();
      setSaldos(response.data);
    } catch (err) {
      setError('Error al cargar los saldos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSaldoColor = (saldo) => {
    if (saldo > 0) return 'success';
    if (saldo < 0) return 'danger';
    return 'secondary';
  };

  const getTipoColor = (tipo) => {
    const tipoNormalizado = tipo?.toUpperCase();
    const colors = {
      'ACTIVO': 'success',
      'PASIVO': 'danger',
      'PATRIMONIO': 'primary',
      'INGRESO': 'info',
      'GASTO': 'warning'
    };
    return colors[tipoNormalizado] || 'secondary';
  };

  const filtrarSaldos = () => {
    if (!filtroTipo) return saldos;
    return saldos.filter(saldo => saldo.tipo?.toUpperCase() === filtroTipo.toUpperCase());
  };

  const calcularTotales = () => {
    const saldosFiltrados = filtrarSaldos();
    return saldosFiltrados.reduce((total, saldo) => total + saldo.saldo, 0);
  };

  const saldosFiltrados = filtrarSaldos();
  const totalGeneral = calcularTotales();

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Control de Saldos por Cuenta</h2>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Header>
          <h5>Filtros</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de Cuenta</Form.Label>
                <Form.Select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="">Todos los tipos</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="PASIVO">Pasivo</option>
                  <option value="PATRIMONIO">Patrimonio</option>
                  <option value="INGRESO">Ingreso</option>
                  <option value="GASTO">Gasto</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={8} className="d-flex align-items-end">
              <div>
                <Badge bg="info" className="fs-6">
                  Total General: ${totalGeneral.toLocaleString()}
                </Badge>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de Saldos */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center">Cargando...</div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cuenta</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Total Débitos</th>
                  <th>Total Créditos</th>
                  <th>Saldo</th>
                  <th>Permite Saldo Negativo</th>
                </tr>
              </thead>
              <tbody>
                {saldosFiltrados.map((saldo) => (
                  <tr key={saldo.cuentaId}>
                    <td><strong>{saldo.codigo}</strong></td>
                    <td>{saldo.nombre}</td>
                    <td>
                      <Badge bg={getTipoColor(saldo.tipo)}>
                        {saldo.tipo?.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={saldo.saldoValido ? 'success' : 'danger'}>
                        {saldo.saldoValido ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </td>
                    <td className="text-end">
                      ${saldo.totalDebitos.toLocaleString()}
                    </td>
                    <td className="text-end">
                      ${saldo.totalCreditos.toLocaleString()}
                    </td>
                    <td className="text-end">
                      <strong className={`text-${getSaldoColor(saldo.saldo)}`}>
                        ${saldo.saldo.toLocaleString()}
                      </strong>
                    </td>
                    <td>
                      <Badge bg={saldo.permiteSaldoNegativo ? 'warning' : 'success'}>
                        {saldo.permiteSaldoNegativo ? 'Sí' : 'No'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Resumen por Tipo */}
      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Resumen por Tipo de Cuenta</h5>
            </Card.Header>
            <Card.Body>
              {['ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'GASTO'].map((tipo) => {
                const saldosTipo = saldos.filter(saldo => saldo.tipo?.toUpperCase() === tipo);
                const totalTipo = saldosTipo.reduce((sum, saldo) => sum + saldo.saldo, 0);
                return (
                  <Row key={tipo} className="mb-2">
                    <Col md={6}>
                      <Badge bg={getTipoColor(tipo)}>
                        {tipo}
                      </Badge>
                    </Col>
                    <Col md={6} className="text-end">
                      <strong className={`text-${getSaldoColor(totalTipo)}`}>
                        ${totalTipo.toLocaleString()}
                      </strong>
                    </Col>
                  </Row>
                );
              })}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Estadísticas</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-2">
                <Col md={6}>Total Cuentas:</Col>
                <Col md={6} className="text-end">
                  <strong>{saldosFiltrados.length}</strong>
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>Cuentas con Saldo Positivo:</Col>
                <Col md={6} className="text-end">
                  <strong className="text-success">
                    {saldosFiltrados.filter(s => s.saldo > 0).length}
                  </strong>
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>Cuentas con Saldo Negativo:</Col>
                <Col md={6} className="text-end">
                  <strong className="text-danger">
                    {saldosFiltrados.filter(s => s.saldo < 0).length}
                  </strong>
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>Cuentas con Saldo Cero:</Col>
                <Col md={6} className="text-end">
                  <strong className="text-secondary">
                    {saldosFiltrados.filter(s => s.saldo === 0).length}
                  </strong>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Saldos; 
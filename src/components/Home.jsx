import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Alert,
  Badge
} from 'react-bootstrap';
import { tercerosService, cuentasService, transaccionesService, saldosService } from '../services/api';

const Home = () => {
  const [stats, setStats] = useState({
    terceros: 0,
    cuentas: 0,
    transacciones: 0,
    saldoTotal: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas en paralelo
      const [tercerosRes, cuentasRes, transaccionesRes, saldosRes] = await Promise.all([
        tercerosService.getAll(),
        cuentasService.getAll(),
        transaccionesService.getAll(),
        saldosService.getSaldos()
      ]);

      const saldoTotal = saldosRes.data.reduce((total, saldo) => total + saldo.saldo, 0);

      setStats({
        terceros: tercerosRes.data.length,
        cuentas: cuentasRes.data.length,
        transacciones: transaccionesRes.data.length,
        saldoTotal: saldoTotal
      });
    } catch (err) {
      setError('Error al cargar las estadísticas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Bienvenido al Sistema Contable</h1>
          <p className="lead">Gestiona tus transacciones financieras de manera eficiente</p>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {/* Estadísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Terceros</Card.Title>
              <h2 className="text-primary">{stats.terceros}</h2>
              <Card.Text>Registrados en el sistema</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Cuentas Contables</Card.Title>
              <h2 className="text-success">{stats.cuentas}</h2>
              <Card.Text>Configuradas</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Transacciones</Card.Title>
              <h2 className="text-info">{stats.transacciones}</h2>
              <Card.Text>Registradas</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Saldo Total</Card.Title>
              <h2 className={stats.saldoTotal >= 0 ? 'text-success' : 'text-danger'}>
                ${stats.saldoTotal.toLocaleString()}
              </h2>
              <Card.Text>Balance general</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Información del Sistema */}
      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Características del Sistema</h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Badge bg="success" className="me-2">✓</Badge>
                  Gestión completa de terceros
                </li>
                <li className="mb-2">
                  <Badge bg="success" className="me-2">✓</Badge>
                  Plan de cuentas configurable
                </li>
                <li className="mb-2">
                  <Badge bg="success" className="me-2">✓</Badge>
                  Transacciones con múltiples partidas
                </li>
                <li className="mb-2">
                  <Badge bg="success" className="me-2">✓</Badge>
                  Validación de partida doble
                </li>
                <li className="mb-2">
                  <Badge bg="success" className="me-2">✓</Badge>
                  Control de saldos por cuenta
                </li>
                <li className="mb-2">
                  <Badge bg="success" className="me-2">✓</Badge>
                  Validación de cuentas inactivas
                </li>
                <li className="mb-2">
                  <Badge bg="success" className="me-2">✓</Badge>
                  Filtros y reportes
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Funcionalidades Principales</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6>Terceros</h6>
                <p className="text-muted">
                  Registra y gestiona información de clientes, proveedores y otros terceros 
                  con diferentes tipos de documentos.
                </p>
              </div>
              <div className="mb-3">
                <h6>Cuentas Contables</h6>
                <p className="text-muted">
                  Configura tu plan de cuentas con diferentes tipos (activo, pasivo, patrimonio, 
                  ingreso, gasto) y controla cuáles están activas.
                </p>
              </div>
              <div className="mb-3">
                <h6>Transacciones</h6>
                <p className="text-muted">
                  Crea transacciones con múltiples partidas, validando que los débitos 
                  y créditos estén balanceados.
                </p>
              </div>
              <div>
                <h6>Saldos</h6>
                <p className="text-muted">
                  Consulta saldos actuales por cuenta con indicadores visuales y 
                  validaciones de saldo negativo.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Información Técnica */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5>Información Técnica</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <h6>Frontend</h6>
                  <ul className="list-unstyled">
                    <li>• React.js 19.1.0</li>
                    <li>• React Bootstrap</li>
                    <li>• React Router DOM</li>
                    <li>• Axios para API calls</li>
                  </ul>
                </Col>
                <Col md={4}>
                  <h6>Backend</h6>
                  <ul className="list-unstyled">
                    <li>• Java con Spring Boot</li>
                    <li>• Base de datos relacional</li>
                    <li>• API REST</li>
                    <li>• Validaciones de negocio</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;

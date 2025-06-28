import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const NavigationBar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Sistema Contable
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/terceros" 
              className={isActive('/terceros')}
            >
              Terceros
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/cuentas" 
              className={isActive('/cuentas')}
            >
              Cuentas Contables
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/transacciones" 
              className={isActive('/transacciones')}
            >
              Transacciones
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/saldos" 
              className={isActive('/saldos')}
            >
              Saldos
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar; 
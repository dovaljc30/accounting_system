import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Componentes
import NavigationBar from './components/Navbar.jsx';
import Home from './components/Home.jsx';
import Terceros from './components/Terceros.jsx';
import CuentasContables from './components/CuentasContables.jsx';
import Transacciones from './components/Transacciones.jsx';
import Saldos from './components/Saldos.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <NavigationBar />
        <main className="py-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/terceros" element={<Terceros />} />
            <Route path="/cuentas" element={<CuentasContables />} />
            <Route path="/transacciones" element={<Transacciones />} />
            <Route path="/saldos" element={<Saldos />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

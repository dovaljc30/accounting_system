# Sistema Contable Básico - Frontend

## ✅ Cumplimiento de la Prueba Técnica FullStack

Este sistema cumple con todos los requisitos funcionales y técnicos solicitados en la prueba técnica:

- Gestión de terceros, cuentas contables, transacciones y partidas.
- Validación de partida doble (débitos = créditos).
- Filtros por fecha y tercero en transacciones.
- Control de saldos por cuenta, con colores y validación de saldo negativo.
- Propuesta e implementación de control de cuentas activas/inactivas:
  - Solo se pueden usar cuentas activas en nuevas transacciones.
  - Se puede activar/desactivar cuentas desde la interfaz.
  - El backend valida que no se usen cuentas inactivas.
- Lógica de negocio robusta y validaciones en backend y frontend.
- Interfaz clara, responsiva y amigable.

---

## Propuesta de Mejora: Control de Cuentas Inactivas

**Escenario:** El sistema originalmente permitía usar cualquier cuenta contable, sin importar su estado.

**Mejora implementada:**
- Se agregó el campo `activo` a las cuentas contables.
- Solo se muestran cuentas activas al crear nuevas transacciones.
- El backend rechaza cualquier intento de usar cuentas inactivas.
- Se puede activar/desactivar cuentas desde la interfaz.
- Esta lógica está documentada y validada tanto en backend como en frontend.

**Ventaja:** Esto evita errores contables y asegura que solo se usen cuentas válidas en los registros financieros.

---

## Descripción

Sistema contable básico desarrollado en React.js que permite gestionar transacciones financieras, terceros, cuentas contables y control de saldos. El frontend se conecta con un backend desarrollado en Java con Spring Boot.

## Características Principales

### ✅ Funcionalidades Implementadas

1. **Gestión de Terceros**
   - Registro y edición de terceros
   - Diferentes tipos de documento (CC, CE, NIT, TI, PP)
   - Validaciones de datos

2. **Gestión de Cuentas Contables**
   - Plan de cuentas configurable
   - Tipos de cuenta: Activo, Pasivo, Patrimonio, Ingreso, Gasto
   - Control de cuentas activas/inactivas
   - Configuración de saldo negativo permitido

3. **Gestión de Transacciones**
   - Creación de transacciones con múltiples partidas
   - Validación de partida doble (débitos = créditos)
   - Filtros por fecha y tercero
   - Visualización detallada de transacciones

4. **Control de Saldos**
   - Cálculo automático de saldos por cuenta
   - Indicadores visuales con colores (verde: positivo, rojo: negativo, gris: cero)
   - Filtros por tipo de cuenta
   - Estadísticas y resúmenes

### 🔧 Mejoras Implementadas

#### Punto de Propuesta: Control de Cuentas Inactivas

**Problema identificado**: El sistema permitía usar cualquier cuenta contable sin verificar su estado.

**Solución implementada**:

1. **Backend**:
   - Agregado campo `activo` (boolean) a la entidad `CuentaContable`
   - Endpoint para activar/desactivar cuentas: `PATCH /api/cuentas/{id}/toggle-activo`
   - Endpoint para obtener solo cuentas activas: `GET /api/cuentas/activas`
   - Validación en transacciones: solo permite usar cuentas activas

2. **Frontend**:
   - Interfaz para activar/desactivar cuentas
   - En transacciones, solo muestra cuentas activas en los selectores
   - Indicadores visuales del estado de las cuentas
   - Mensajes de error si se intenta usar cuentas inactivas

#### Punto Avanzado: Verificación y Validación de Saldos

**Funcionalidades implementadas**:

1. **Cálculo de Saldos**:
   - Endpoint: `GET /api/saldos`
   - Fórmula: Saldo = Suma de débitos - Suma de créditos
   - Colores: Verde (positivo), Rojo (negativo), Gris (cero)

2. **Validación de Saldo Negativo**:
   - Al crear transacciones, verifica si la cuenta permite saldo negativo
   - Si no permite y la transacción provocaría saldo negativo, rechaza con mensaje explicativo
   - Lógica de negocio robusta en el backend

3. **Interfaz de Saldos**:
   - Tabla con saldos actuales por cuenta
   - Filtros por tipo de cuenta
   - Resumen por tipo de cuenta
   - Estadísticas generales

## Tecnologías Utilizadas

### Frontend
- **React.js 19.1.0**: Framework principal
- **React Router DOM**: Enrutamiento
- **React Bootstrap**: Componentes de UI
- **Axios**: Cliente HTTP para API calls
- **Bootstrap 5**: Framework CSS

### Backend (Ya implementado)
- **Java con Spring Boot**
- **Base de datos relacional** (PostgreSQL/MySQL)
- **API REST**

## Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Backend corriendo en `http://localhost:8080`

### Instalación

1. **Clonar el repositorio**:
```bash
git clone <url-del-repositorio>
cd accounting_system
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar la API**:
   - Editar `src/services/api.js`
   - Verificar que `API_BASE_URL` apunte a tu backend

4. **Ejecutar el proyecto**:
```bash
npm start
```

5. **Abrir en el navegador**:
   - http://localhost:3000

## Estructura del Proyecto

```
src/
├── components/
│   ├── Navbar.js          # Navegación principal
│   ├── Home.js            # Página de inicio/dashboard
│   ├── Terceros.js        # Gestión de terceros
│   ├── CuentasContables.js # Gestión de cuentas
│   ├── Transacciones.js   # Gestión de transacciones
│   └── Saldos.js          # Control de saldos
├── services/
│   └── api.js             # Servicios de API
├── App.js                 # Componente principal
├── App.css               # Estilos
└── index.js              # Punto de entrada
```

## API Endpoints Utilizados

### Terceros
- `GET /api/terceros` - Listar todos
- `POST /api/terceros` - Crear
- `PUT /api/terceros/{id}` - Actualizar
- `DELETE /api/terceros/{id}` - Eliminar

### Cuentas Contables
- `GET /api/cuentas` - Listar todas
- `GET /api/cuentas/activas` - Listar activas
- `POST /api/cuentas` - Crear
- `PUT /api/cuentas/{id}` - Actualizar
- `PATCH /api/cuentas/{id}/toggle-activo` - Activar/desactivar
- `DELETE /api/cuentas/{id}` - Eliminar

### Transacciones
- `GET /api/transacciones` - Listar todas
- `GET /api/transacciones/filtros` - Filtrar
- `POST /api/transacciones` - Crear
- `PUT /api/transacciones/{id}` - Actualizar
- `DELETE /api/transacciones/{id}` - Eliminar

### Saldos
- `GET /api/saldos` - Obtener saldos por cuenta
- `GET /api/saldos/cuenta/{id}` - Saldo de cuenta específica

## Validaciones Implementadas

### Frontend
- **Formularios**: Validación de campos requeridos
- **Transacciones**: Validación de partida doble en tiempo real
- **Cuentas**: Solo muestra cuentas activas en transacciones
- **Saldos**: Validación de saldo negativo según configuración

### Backend (Ya implementado)
- **Entidades**: Validaciones de datos
- **Negocio**: Lógica de validación de saldos
- **Transacciones**: Validación de partida doble
- **Cuentas**: Control de estado activo/inactivo

## Características de UX/UI

- **Interfaz responsiva**: Funciona en dispositivos móviles y desktop
- **Navegación intuitiva**: Menú lateral con indicadores de página activa
- **Feedback visual**: Alertas de éxito/error, indicadores de carga
- **Colores semánticos**: Verde (éxito), Rojo (error), Azul (info)
- **Tablas interactivas**: Hover effects, ordenamiento
- **Modales**: Formularios en ventanas modales
- **Filtros avanzados**: Búsqueda y filtrado por múltiples criterios

## Funcionalidades Avanzadas

### Dashboard
- Estadísticas en tiempo real
- Resumen de datos principales
- Información del sistema

### Filtros y Búsqueda
- Filtros por fecha en transacciones
- Filtros por tercero
- Filtros por tipo de cuenta en saldos

### Validaciones en Tiempo Real
- Cálculo automático de totales en transacciones
- Validación de balance (débitos = créditos)
- Indicadores visuales de estado

# La Fortaleza
### Sistema de Gestión de Inventario y Punto de Venta — Tienda La Fortaleza

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Producción-black?logo=vercel)
![PWA](https://img.shields.io/badge/PWA-Offline--First-purple)
![Status](https://img.shields.io/badge/Status-Live%20desde%201%20Mayo%202026-success)
![License Cost](https://img.shields.io/badge/Costo%20de%20Licencias-%240%20MXN-brightgreen)

🌐 **[Ver aplicación en producción](https://la-fortaleza-kappa.vercel.app)**
📦 **[Repositorio](https://github.com/Gappy1223/La-Fortaleza)**

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [El Problema de Negocio](#el-problema-de-negocio)
3. [Solución Implementada](#solución-implementada)
4. [Stack Tecnológico](#stack-tecnológico)
5. [Módulos del Sistema](#módulos-del-sistema)
6. [Sistema de Alertas por Caducidad](#sistema-de-alertas-por-caducidad)
7. [Arquitectura de la Aplicación](#arquitectura-de-la-aplicación)
8. [Plataforma Tecnológica Requerida](#plataforma-tecnológica-requerida)
9. [Plan de Desarrollo — Metodología Ágil](#plan-de-desarrollo--metodología-ágil)
10. [Plan de Implementación](#plan-de-implementación)
11. [Resultados de Implementación](#resultados-de-implementación)
12. [Análisis Financiero](#análisis-financiero)
13. [Instalación y Configuración](#instalación-y-configuración)
14. [Hoja de Ruta — Fase 2](#hoja-de-ruta--fase-2)
15. [Estándares y Metodología](#estándares-y-metodología)
16. [Autor](#autor)

---

## Resumen Ejecutivo

**La Fortaleza** es un Sistema de Gestión de Inventario y Punto de Venta (POS) desarrollado e implementado en producción para **Tienda La Fortaleza**, una PYME familiar con 14 años de operación en Cuautitlán Izcalli, Estado de México. La tienda enfrentaba pérdidas mensuales de $5,500–$8,000 MXN por productos caducados, sin ningún sistema digital de control.

La solución es una **Aplicación Web Progresiva (PWA)** con arquitectura Offline-First que garantiza la continuidad operativa sin importar la conectividad. Construida con tecnologías 100% open source y freemium, con un **costo de infraestructura de $0 MXN**.

| Métrica | Valor |
|---|---|
| Satisfacción del cliente | **4.9 / 5** (propietaria del negocio) |
| Casos de prueba exitosos | **100%** (12/12 PASS) |
| Personal capacitado | **3 personas** (propietaria, encargado, ayudante) |
| Días de desarrollo | **135 días** en 5 sprints |
| Go-live | **1 de Mayo de 2026** |
| Inversión inicial | **$52,800 MXN** |
| ROI al Año 5 | **112.20%** ($59,241 MXN ganancia neta) |
| Punto de equilibrio | **Mes 30** |
| Costo de licencias | **$0 MXN** |
| Pérdidas anuales objetivo a eliminar | **Hasta $96,000 MXN** |

---

## El Problema de Negocio

Tienda La Fortaleza opera desde hace 14 años atendiendo a familias, personas de la tercera edad y trabajadores de Cuautitlán Izcalli con productos de canasta básica, lácteos, carnes frías y servicios complementarios como recargas y pagos de servicios.

### Diagnóstico Previo a la Implementación

Sin ningún sistema de control, la tienda operaba con tres ineficiencias críticas:

| Problema | Impacto Medido |
|---|---|
| Sin control de fechas de caducidad | **$5,500–$8,000 MXN mensuales** en mermas ($66,000–$96,000 anuales) |
| Capital bloqueado en productos sin rotación | **$15,000–$20,000 MXN** inmovilizados |
| Compras por intuición sin datos | Sobre-stock innecesario estimado en **$5,000–$8,000 MXN/año** |
| Cero visibilidad del inventario en tiempo real | Decisiones basadas en memoria, no en datos |
| Sin registro digital de ventas | Imposibilidad de identificar productos más vendidos o sin rotación |

### Contexto Tecnológico de la Empresa Antes del Proyecto

La tienda contaba únicamente con terminales de Lotería Nacional y VIA Servicios (precargadas por los proveedores), un módem Telmex y smartphones del personal. **No existía ningún plan de TI ni sistema digital propio.**

### Hipótesis del Proyecto

> La implementación de un sistema de gestión de inventario reducirá las pérdidas por productos caducados en un **60% durante los primeros 6 meses** de operación, al proporcionar alertas preventivas sobre fechas de caducidad y mejorar la visibilidad del stock.

---

## Solución Implementada

Se desarrolló un Sistema de Gestión de Inventario y Punto de Venta (POS) bajo tres pilares fundamentales:

```
┌──────────────────────────────────────────────────────────┐
│                    PILARES DE LA SOLUCIÓN                │
├──────────────────────────────────────────────────────────┤
│     OFFLINE-FIRST                                        │
│  Operación continua sin internet.                        │
│  Sincronización automática al reconectar.                │
├──────────────────────────────────────────────────────────┤
│     MULTI-DISPOSITIVO                                    │
│  Smartphones, tablets y computadoras.                    │
│  Sin inversión adicional en hardware.                    │
├──────────────────────────────────────────────────────────┤
│     ALERTAS AUTOMÁTICAS                                  │
│  Semáforo visual (Rojo/Amarillo/Verde).                  │
│  Prevención de mermas antes de que ocurran.              │
└──────────────────────────────────────────────────────────┘
```

### Alternativas Evaluadas y Descartadas

| Alternativa | Costo | Razón de Descarte |
|---|---|---|
| Software comercial empaquetado | $15,000–$50,000 MXN | Costo prohibitivo + funcionalidades genéricas |
| Outsourcing a agencia | $80,000–$150,000 MXN | 3–5× más caro + menor control del proceso |
| Plataformas SaaS | $2,400–$6,000 USD/año | Costos recurrentes + dependencia de terceros |
| **Desarrollo a medida (elegida)** | **$52,800 MXN** | **Código 100% propiedad de la tienda, adaptado al negocio** |

---

## Stack Tecnológico

Infraestructura de nivel empresarial con **costo de licencias de $0 MXN**.

| Capa | Tecnología | Rol | Costo |
|---|---|---|---|
| UI Framework | React 18 | Construcción de interfaces reactivas | $0 — Open Source |
| Estilos | Tailwind CSS | Diseño responsive utility-first | $0 — Open Source |
| Iconografía | Lucide React | Íconos modernos y consistentes | $0 — Open Source |
| Gráficas | Recharts | Visualización de datos en reportes | $0 — Open Source |
| Exportación | Papaparse | Generación de archivos CSV | $0 — Open Source |
| BD Local | IndexedDB | Almacenamiento offline nativo del navegador | $0 — API nativa |
| Offline | Service Workers | PWA + cola de sincronización | $0 — API nativa |
| Backend / BD | Supabase (PostgreSQL) | BaaS + base de datos relacional en la nube | $0 — Plan Freemium |
| Seguridad | Row Level Security | Seguridad de acceso por filas en PostgreSQL | Incluido en Supabase |
| Hosting | Vercel | Deploy con CDN global y CI/CD desde GitHub | $0 — Plan Freemium |
| SSL | HTTPS automático | Certificado de seguridad incluido en Vercel | $0 — Incluido |
| Control de versiones | Git + GitHub | Versionamiento y despliegue continuo | $0 — Plan Gratuito |
| Editor | Visual Studio Code | Entorno de desarrollo | $0 — Open Source |

---

## Módulos del Sistema

La aplicación cuenta con **7 módulos funcionales** integrados en una sola PWA.

### Dashboard Ejecutivo
Visualización en tiempo real del estado del inventario con estadísticas clave:
- Valor total del inventario en tiempo real
- Contadores por nivel de alerta (Vencido / Crítico / Atención / OK)
- Productos más vendidos del período
- Resumen de movimientos del día

### Gestión de Inventario
Registro, edición, consulta y eliminación de productos con información completa:
- Nombre, categoría, cantidad, precios de compra/venta
- Fecha de caducidad y código de barras
- Proveedor, ubicación en tienda
- Clasificación automática por nivel de alerta

### Sistema de Alertas por Caducidad
*(Ver sección detallada abajo)*
- Clasificación visual en 4 niveles por código de colores
- Alertas configurables a 7, 3 y 1 día antes del vencimiento

### Control de Movimientos
Historial completo de todas las operaciones con trazabilidad:
- **Entradas:** registro de nuevas compras a proveedores
- **Salidas / Ventas:** registro de productos vendidos con actualización de stock
- **Mermas:** baja de productos vencidos o dañados con valor registrado

### Punto de Venta (POS)
Módulo dedicado para el registro rápido de ventas en mostrador:
- Transacciones completadas en **menos de 18 segundos**
- Actualización automática del inventario en cada venta
- Integración directa con el módulo de movimientos

### Cortes de Caja
Control financiero al cierre de jornada:
- Registro del efectivo esperado vs. efectivo real
- Detección temprana de diferencias en efectivo
- Historial de cortes para revisión posterior

### Reportes y Análisis
Generación de reportes accionables para la toma de decisiones:
- Reporte de mermas (productos vencidos con valor económico)
- Top 10 productos más vendidos
- Rotación de inventario (productos con baja o nula rotación)
- Exportación a CSV para análisis externo

---

## Sistema de Alertas por Caducidad

El corazón del sistema para combatir las mermas: clasificación automática de todos los productos en 4 niveles visuales.

| Nivel | Color | Condición | Acción Recomendada |
|---|---|---|---|
| **Vencido** | Rojo intenso | Fecha de caducidad ya superada | Dar de baja inmediatamente como merma |
| **Crítico** | Naranja | Vence en ≤ 3 días | Promoción inmediata o retiro de anaquel |
| **Atención** | Amarillo | Vence en ≤ 7 días | Planificar promoción o priorizar venta |
| **OK** | Verde | Stock en buen estado | Sin acción requerida |

La propietaria revisa el Dashboard cada mañana al inicio de jornada para identificar productos en niveles críticos y planificar acciones preventivas antes de que los productos se conviertan en pérdida.

---

## Arquitectura de la Aplicación

```
                        ┌─────────────────────┐
                        │   Usuario Final      │
                        │ (smartphone / PC)    │
                        └──────────┬──────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │      PWA — React 18          │
                    │   Tailwind CSS · Recharts    │
                    │   Lucide · Papaparse         │
                    └───────┬─────────────┬────────┘
                            │             │
              ┌─────────────▼──┐    ┌─────▼──────────────┐
              │  IndexedDB     │    │   Supabase Cloud     │
              │  (Offline BD)  │    │   PostgreSQL 15      │
              │  Service Worker│    │   Row Level Security │
              │  (Sync Queue)  │    │   Real-time Subs     │
              └────────────────┘    └─────────────────────┘
                      ▲                       ▲
                      │   Sincronización      │
                      └───────────────────────┘
                       (al recuperar conexión)

                        ┌─────────────────────┐
                        │   Vercel CDN        │
                        │   CI/CD desde GitHub│
                        │   HTTPS automático  │
                        └─────────────────────┘
```

**Flujo Offline-First:**
1. Todas las operaciones se realizan primero en IndexedDB (local)
2. Service Worker mantiene una cola de cambios pendientes
3. Al detectar conectividad, se sincronizan automáticamente con Supabase
4. El usuario nunca experimenta interrupciones por falta de internet

---

## Plataforma Tecnológica Requerida

### Hardware (Dispositivos de Acceso)

| Requerimiento | Mínimo | Notas |
|---|---|---|
| Sistema operativo | Android 8.0+ / iOS 12+ / Windows 10+ | La tienda ya tiene dispositivos compatibles |
| Procesador | Quad-core 1.4 GHz | — |
| RAM | 2 GB | — |
| Almacenamiento | 100 MB disponibles | — |
| Pantalla | 4.5 pulgadas mínimo | — |
| Internet | WiFi o 3G/4G (mínimo 5 Mbps) | La tienda tiene 20 Mbps — sin inversión adicional |

### Navegadores Compatibles

| Navegador | Versión Mínima |
|---|---|
| Google Chrome | 90+ (recomendado) |
| Safari | 14+ (para iOS) |
| Firefox | 88+ |
| Microsoft Edge | 90+ |

### Servicios Cloud (Todos Gratuitos)

| Servicio | Uso | Límite Gratuito | Costo |
|---|---|---|---|
| Supabase | Base de datos + Auth | 500 MB | $0/mes |
| Vercel | Hosting + CI/CD | Proyectos ilimitados | $0/mes |
| GitHub | Control de versiones | Repositorios públicos | $0/mes |

---

## Plan de Desarrollo — Metodología Ágil

El proyecto se desarrolló en **135 días** (días laborales) usando **5 sprints** de metodología ágil.

### Fases del Proyecto

| Fase | Descripción | Duración | Estado |
|---|---|---|---|
| **Fase 1** | Concepción y Planificación — Investigación de tecnologías, definición de alcance | 6 días | ✅ Completado |
| **Fase 2** | Diseño y Desarrollo — Arquitectura, BD, mockups y 5 sprints de desarrollo | 82 días | ✅ Completado |
| **Fase 3** | Pruebas y QA — Funcionales, usabilidad, corrección de bugs, aceptación | 18 días | ✅ Completado |
| **Fase 4** | Implementación y Monitoreo — Puesta en marcha, capacitación, piloto, ROI | 35 días | ✅ Completado |

### Desglose de los 5 Sprints de Desarrollo

| Sprint | Entregables | Resultado |
|---|---|---|
| Sprint 1 | Registro de productos, visualización de inventario | Base del catálogo funcional |
| Sprint 2 | Lógica de alertas por caducidad, notificaciones visuales | Semáforo de caducidades operativo |
| Sprint 3 | Registro de entradas, salidas/ventas, mermas | Control de movimientos completo |
| Sprint 4 | Reporte de mermas, reporte de rotación de inventario | Módulo de reportes accionables |
| Sprint 5 | Funcionalidad offline, optimización de rendimiento | PWA Offline-First estabilizada |

### Análisis PERT — Ruta Crítica

**Duración del proyecto: 135 días**

| ID | Actividad | Días | ES | EF | Holgura | Crítica |
|---|---|---|---|---|---|---|
| A | Planeación | 6 | 0 | 6 | 0 | Sí |
| B | Diseño | 9 | 6 | 15 | 0 | Sí |
| C | Sprint 1 | 15 | 15 | 30 | 0 | Sí |
| D | Sprint 2 | 13 | 30 | 43 | 0 | Sí |
| E | Sprint 3 | 13 | 43 | 56 | 0 | Sí |
| F | Sprint 4 | 13 | 56 | 69 | 0 | Sí |
| G | Sprint 5 | 13 | 69 | 82 | 0 | Sí |
| H | QA | 18 | 82 | 100 | 0 | Sí |
| I | Implementación | 9 | 100 | 109 | 0 | Sí |
| J | Monitoreo | 5 | 109 | 114 | 0 | Sí |
| K | Soporte | 21 | 114 | 135 | 0 | Sí |
| L | Métricas + ROI | 7 | 114 | 121 | **14** | No |

**Ruta Crítica:** Planeación → Diseño → Sprint 1 → Sprint 2 → Sprint 3 → Sprint 4 → Sprint 5 → QA → Implementación → Monitoreo → Soporte = **135 días**

---

## Plan de Implementación

### Calendario de Implementación — Detalle

| Actividad | Fecha Inicio | Fecha Fin | Duración |
|---|---|---|---|
| 4.1 Preparación del entorno de producción | 22 Abr 2026 | 24 Abr 2026 | 3 días |
| 4.2 Capacitación al personal (4 sesiones) | 27 Abr 2026 | 29 Abr 2026 | 3 días |
| 4.3 Carga inicial del inventario real | 30 Abr 2026 | 1 May 2026 | 2 días |
| 4.4 **Go-Live — Despliegue en producción** | **1 May 2026** | **1 May 2026** | **1 día** |
| 4.5 Operación piloto y monitoreo | 1 May 2026 | 7 May 2026 | 5 días |
| 4.6 Soporte y ajustes post-lanzamiento | 1 May 2026 | 31 May 2026 | 1 mes |
| 4.7 Recolección de métricas | 1 May 2026 | 7 May 2026 | 5 días |
| 4.8 Informe de resultados ROI | 7 May 2026 | 9 May 2026 | 3 días |

### Estrategia de Implementación

Se optó por **implementación directa con período piloto de 1 semana**, adecuado al tamaño de la operación. En caso de problemas críticos, el plan incluye rollback inmediato.

### Capacitación del Personal

Se realizaron **4 sesiones de capacitación** en 3 días:

| Sesión | Fecha | Duración | Contenido | Participantes |
|---|---|---|---|---|
| Sesión 1 | 27 Abr | 2 horas | Introducción, navegación, dashboard, alertas | Propietaria + Encargado |
| Sesión 2 | 28 Abr | 2 horas | Gestión de inventario, movimientos, casos especiales | Propietaria + Encargado |
| Sesión 3 | 29 Abr | 1 hora | Reportes y toma de decisiones | Propietaria |
| Sesión 4 | 29 Abr | 2 horas | Operación diaria del POS, flujo de ventas | Encargado + Ayudante |

**Materiales entregados:** Manual de usuario en PDF.

### Carga Inicial del Inventario

Inventario real capturado en 2 días:

| Día | Categorías | Productos Estimados |
|---|---|---|
| Día 1 (30 Abr) | Lácteos, carnes frías, bebidas perecederas | 90–120 productos |
| Día 2 (1 May) | Abarrotes, limpieza, aseo personal | 180–250 productos |

### Esquema de Soporte Post-Lanzamiento

| Período | Horario de Soporte | Tiempo de Respuesta | Modalidad |
|---|---|---|---|
| Soporte Intensivo (1–7 May) | 8:00 AM – 8:00 PM | < 1 hora | WhatsApp + visita presencial |
| Soporte Regular (8–31 May) | Disponible | < 4 horas | WhatsApp + llamada semanal |

**Niveles de soporte:**
- **Nivel 1 — Usuario:** Dudas sobre funciones → Propietaria como primera línea
- **Nivel 2 — Técnico:** Errores del sistema, conectividad → Desarrollador
- **Nivel 3 — Desarrollo:** Bugs críticos, nuevas funcionalidades urgentes → Desarrollador

---

## Resultados de Implementación

### Métricas de Calidad — Pruebas de Aceptación

| Métrica | Meta | Resultado |
|---|---|---|
| Casos de prueba exitosos | ≥ 95% | **100% (12/12 PASS)**  |
| Satisfacción del cliente (propietaria) | > 4.5 / 5 | **4.9 / 5**  |
| Satisfacción del personal (capacitación) | > 4 / 5 | **4.75 / 5**  |
| Tiempo de registro de venta (POS) | < 30 segundos | **< 18 segundos**  |
| Ventas registradas vs. ventas reales (piloto) | 100% | **100%**  |
| Productos con stock incorrecto (piloto) | < 2% | **< 2%**  |
| Personal habilitado | 3 personas | **3 personas**  |

### Estado del Sistema al Go-Live

-  Módulos completados: Dashboard, Inventario, Alertas, Movimientos, POS, Cortes de Caja, Reportes
-  Funcionalidad Offline-First operativa con cola de sincronización automática
-  Deploy en Vercel con integración continua desde GitHub
-  Inventario real cargado (270–370 productos en categorías perecederas y no perecederas)
-  Personal capacitado con materiales de apoyo entregados
-  Backups automáticos diarios configurados en Supabase (retención 7 días)
-  Row Level Security habilitado en todas las tablas

### Validación de Hipótesis

La hipótesis planteada (reducción del 60% en mermas en los primeros 6 meses) requiere el período completo de operación regular para su confirmación. Los resultados del piloto operativo (1–7 de mayo de 2026) mostraron **tendencias positivas** que respaldan la viabilidad del objetivo.

---

## Análisis Financiero

### Inversión Inicial: $52,800 MXN

| Concepto | Subtotal |
|---|---|
| Desarrollo de aplicación (80 horas × $500/hr) | $40,000 MXN |
| Implementación y capacitación | $12,800 MXN |
| Software, herramientas e infraestructura | **$0 MXN** (todo open source / freemium) |
| **TOTAL** | **$52,800 MXN** |

### Costos Operativos Anuales: $48,800 MXN

| Concepto | Anual |
|---|---|
| Soporte técnico (60 hrs × $400/hr) | $24,000 MXN |
| Actualizaciones (4 sprints trimestrales × $5,000) | $20,000 MXN |
| Capacitación continua del personal (16 hrs × $300) | $4,800 MXN |
| Infraestructura y hosting | **$0 MXN** |
| **TOTAL** | **$48,800 MXN** |

### Beneficios Anuales Proyectados: $69,900 MXN (promedio)

| Beneficio | Conservador | Optimista | **Promedio** |
|---|---|---|---|
| Reducción de mermas (60–70%) | $39,600 | $67,200 | **$53,400** |
| Mejora en rotación de inventario | $8,000 | $12,000 | **$10,000** |
| Optimización de compras | $5,000 | $8,000 | **$6,500** |
| **Total Beneficios Anuales** | **$52,600** | **$87,200** | **$69,900** |

### Proyección ROI a 5 Años

| Métrica | Año 0 | Año 1 | Año 2 | Año 3 | Año 4 | Año 5 |
|---|---|---|---|---|---|---|
| Inversión Inicial | −$52,800 | $0 | $0 | $0 | $0 | $0 |
| Costos Operativos | $0 | −$48,800 | −$48,800 | −$48,800 | −$53,680 | −$59,048 |
| Beneficios Generados | $0 | $69,900 | $69,900 | $69,900 | $76,890 | $84,579 |
| **Flujo Neto Anual** | −$52,800 | $21,100 | $21,100 | $21,100 | $23,210 | $25,531 |
| **Flujo Neto Acumulado** | −$52,800 | −$31,700 | −$10,600 | **+$10,500** | $33,710 | $59,241 |
| **ROI** | −100% | −60.04% | −20.08% | **+19.89%** | **+63.84%** | **+112.20%** |

**Punto de Equilibrio:** $52,800 / $21,100 × 12 = **Mes 30**

> A partir del Año 3 (Mes 30) el proyecto genera ganancia neta. Al Año 5: **$59,241 MXN de utilidad acumulada** con un ROI del 112.20%.

---

## Instalación y Configuración

### Prerrequisitos

```
Node.js v20.x o superior
npm 10.x o superior
Git 2.x o superior
Cuenta en Supabase (gratuita)
Cuenta en Vercel (gratuita)
```

### 1. Clonar el repositorio

```bash
git clone https://github.com/Gappy1223/La-Fortaleza.git
cd La-Fortaleza
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://[PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON_KEY]
```

### 4. Configurar Supabase

En tu proyecto de Supabase, crear las tablas necesarias con las políticas de Row Level Security (RLS) configuradas. Habilitar backups automáticos diarios con retención de 7 días.

### 5. Iniciar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 6. Build para producción

```bash
npm run build
```

### 7. Deploy en Vercel

Conectar el repositorio de GitHub a Vercel. Cada push a `main` desplegará automáticamente gracias a la integración CI/CD.

---

## Hoja de Ruta — Fase 2

### Funcionalidades Planeadas

| Prioridad | Funcionalidad | Justificación |
|---|---|---|
|  Alta | **Impresión de tickets de venta** | Solicitud más mencionada en pruebas de aceptación |
|  Alta | **Sistema multi-usuario con roles** | Para crecimiento del equipo o segunda sucursal |
|  Media | **Integración con WhatsApp Business** | Envío automático de reportes mensuales a la propietaria |
|  Media | **Escaneo de código de barras** | Agilizar captura y ventas con la cámara del smartphone |
|  Baja | **Módulo de proveedores** | Órdenes de compra automáticas por niveles mínimos |
|  Baja | **Análisis predictivo** | Disponible al acumular 12+ meses de historial |

## Estándares y Metodología

Este proyecto fue desarrollado alineado a los siguientes marcos de referencia:

| Marco | Aplicación en el Proyecto |
|---|---|
| **ITIL v4** | Niveles de soporte documentados (L1/L2/L3), gestión de incidencias durante piloto, continuidad del servicio con Offline-First |
| **PMBOK** | Cronograma por fases, análisis PERT con ruta crítica, gestión de alcance documentada, análisis financiero con ROI y punto de equilibrio |
| **ISO/IEC 25010** | Funcionalidad (12/12 casos de prueba), confiabilidad (offline-first), usabilidad (4.9/5 satisfacción), eficiencia (<18 seg por transacción) |
| **Metodología Ágil** | 5 sprints iterativos con entregables tangibles por sprint, feedback continuo de la propietaria como usuario experto |
| **DevOps / CI/CD** | Integración continua desde GitHub → Vercel, deploy automático en cada push a `main` |
| **Seguridad (OWASP)** | Row Level Security en Supabase, HTTPS automático, variables de entorno en `.env.local` excluidas del repositorio |
| **Canvas Model (BMBOK)** | Análisis completo del modelo de negocio del cliente (socios, actividades, recursos, propuesta de valor, canales, segmentos, costos e ingresos) |

---

## Autor

**Juan Fernando Macías Mandujano**
Estudiante de Ingeniería en Sistemas Computacionales — Universidad Tecmilenio (8vo semestre)

[![GitHub](https://img.shields.io/badge/GitHub-Gappy1223-black?logo=github)](https://github.com/Gappy1223)
[![App en Producción](https://img.shields.io/badge/Demo-la--fortaleza.vercel.app-black?logo=vercel)](https://la-fortaleza-kappa.vercel.app)
[![Email](https://img.shields.io/badge/Email-jmacias1223%40outlook.com-blue?logo=microsoft-outlook)](mailto:jmacias1223@outlook.com)

**Proyecto académico:** Gestión Avanzada de TI
**Profesora:** Elizabeth Cavita Huerta
**Universidad:** Tecmilenio — Campus Virtual
**Período:** Enero – Mayo 2026

---

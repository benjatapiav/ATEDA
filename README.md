# 📘 Manual descriptivo de ATEDA

## 🛠️ Desarrollo del proyecto ATEDA

**Sistema de alerta temprana para la identificación de estudiantes con posibles dificultades del aprendizaje**

---

## 📖 Introducción

Este manual tiene como propósito describir el desarrollo e implementación del proyecto **ATEDA**.

Se presenta la idea central que impulsa su construcción, los objetivos del proyecto, su estructura, las fuentes de información utilizadas, el funcionamiento del sistema de alertas y las tecnologías involucradas en su desarrollo.

El documento será actualizado progresivamente a medida que avance el proyecto.

---

## 🎯 Objetivos del manual

Este manual busca brindar una guía estructurada que permita al lector:

1. Comprender los fundamentos y el propósito de ATEDA.
2. Conocer la estructura y el desarrollo del proyecto.
3. Comprender cómo se estructuran y utilizan los datos.
4. Familiarizarse con conceptos propios del área de la psicopedagogía y la educación.
5. Comprender el funcionamiento del sistema de alertas.
6. Conocer las tecnologías utilizadas para la construcción del sistema.
7. Documentar las decisiones tomadas durante el desarrollo del proyecto.

---

## 👤 Integrante

Por decisión propia no cuento con un equipo de desarrollo, por lo que el proyecto será diseñado, desarrollado, probado y documentado de manera individual.

- **Benjamín Tapia**

---

## 🧠 Origen e idea central

ATEDA nace a partir de una experiencia personal y de la cercanía con el área de la psicopedagogía.

Mi hijo fue diagnosticado con TDAH y mi esposa es psicopedagoga. Ambas situaciones despertaron mi interés por comprender de mejor manera las dificultades que pueden enfrentar los estudiantes durante su proceso educativo y cómo la tecnología puede contribuir a su identificación temprana.

A partir de esta idea surge **ATEDA**, un sistema orientado a analizar diferentes antecedentes escolares con el propósito de detectar variaciones o patrones que puedan indicar que un estudiante está presentando posibles dificultades en su proceso de aprendizaje.

ATEDA no busca realizar diagnósticos. Su objetivo es funcionar como una herramienta de apoyo que permita advertir situaciones que podrían requerir atención y entregar información organizada a los profesionales responsables del seguimiento del estudiante.

---

## 💡 ¿Qué es ATEDA?

**ATEDA** corresponde a:

> **Sistema de alerta temprana para la identificación de estudiantes con posibles dificultades del aprendizaje.**

El sistema busca reunir y analizar información proveniente de diferentes fuentes del entorno escolar para identificar cambios relevantes en el comportamiento académico de los estudiantes.

Entre los antecedentes considerados se encuentran:

- Asistencia.
- Calificaciones.
- Observaciones docentes.
- Antecedentes académicos.
- Historial de repitencias.
- Informes y documentos asociados al estudiante.

A partir de estos antecedentes, ATEDA podrá generar alertas que permitan orientar la revisión y el seguimiento de cada caso.

---

## 🎓 Alcance educativo

En su primera etapa, ATEDA estará orientado a estudiantes pertenecientes a:

- Educación Básica.
- Educación Media.

El sistema contempla estudiantes desde **1° Básico hasta 4° Medio**.

Inicialmente no se incluirán los niveles de educación parvularia, como Prekínder y Kínder, debido a que requieren criterios de análisis y evaluación diferentes que aumentan considerablemente el alcance del proyecto.

---

## 🏫 Contexto de aplicación

ATEDA está pensado para funcionar dentro del contexto educacional chileno.

El sistema podrá considerar establecimientos:

- Públicos.
- Particulares subvencionados.
- Privados.

Como referencia para la definición y análisis de diferentes indicadores se utilizarán fuentes oficiales y académicas relacionadas con el sistema educativo chileno.

---

## 👥 Usuarios del sistema

El usuario principal de ATEDA será el profesional encargado del seguimiento psicopedagógico de los estudiantes.

Entre los posibles usuarios del sistema se consideran:

- Psicopedagogos/as.
- Docentes.
- Unidad Técnico Pedagógica (UTP).
- Dirección del establecimiento.

Los permisos y funcionalidades disponibles podrán variar dependiendo del rol de cada usuario.

---

## 📊 Indicadores

ATEDA utilizará diferentes indicadores para analizar la evolución de cada estudiante.

Inicialmente se consideran los siguientes:

### 📅 Asistencia

Permitirá analizar:

- Porcentaje de asistencia.
- Evolución de la asistencia.
- Descensos progresivos.
- Persistencia de inasistencias.
- Categorías de asistencia.

### 📝 Calificaciones

Permitirá observar:

- Resultados de evaluaciones.
- Evolución de las calificaciones.
- Descensos en el rendimiento.
- Asignaturas con dificultades.
- Evaluaciones asociadas a Objetivos de Aprendizaje.

### 👨‍🏫 Observaciones docentes

Las observaciones permitirán incorporar información que no necesariamente puede representarse mediante datos numéricos.

Estas podrán considerar aspectos:

- Académicos.
- Conductuales.
- Socioemocionales.
- De participación.

### 📄 Informes y documentos

ATEDA podrá considerar documentos relacionados con el estudiante que aporten antecedentes relevantes para comprender su situación académica y educativa.

---

## 🚨 Sistema de alertas

ATEDA contará con un sistema de alertas que permitirá representar visualmente el nivel de atención asociado a cada estudiante.

Las alertas estarán clasificadas mediante colores:

- 🔵 **Azul**
- 🟡 **Amarillo**
- 🟠 **Naranja**
- 🔴 **Rojo**

El nivel de alerta dependerá de factores como:

- Variación negativa de indicadores.
- Persistencia de una situación.
- Aparición de nuevos indicadores.
- Combinación de diferentes antecedentes.
- Existencia o ausencia de acciones de seguimiento.

Los criterios y umbrales específicos serán definidos durante el desarrollo del proyecto.

---

## 🔎 Seguimiento de casos

Cuando un estudiante presente antecedentes que requieran atención, ATEDA permitirá realizar seguimiento de su situación.

El seguimiento podrá considerar:

- Estado actual del caso.
- Evolución de los indicadores.
- Acciones realizadas.
- Observaciones.
- Nuevos antecedentes.
- Documentos asociados.
- Cambios en el nivel de alerta.

De esta manera, la alerta no será únicamente una advertencia, sino el punto de partida para analizar la evolución del estudiante.

---

## 🧠 Uso de Inteligencia Artificial

ATEDA contempla la integración de un **Modelo de Lenguaje (LLM)** como herramienta de apoyo para el análisis de información textual.

El modelo podrá utilizarse para tareas como:

- Interpretar observaciones docentes.
- Analizar informes.
- Identificar información relevante dentro de textos.
- Relacionar antecedentes del estudiante.
- Generar una explicación asociada a una alerta.
- Apoyar la presentación de información al profesional.

El LLM no será responsable de diagnosticar dificultades del aprendizaje ni de tomar decisiones de manera autónoma.

Su función será complementar la información disponible y facilitar su interpretación.

---

## 🗃️ Datos

ATEDA trabajará principalmente con información estructurada almacenada en una base de datos.

Entre las entidades que se contemplan se encuentran:

- Estudiantes.
- Cursos.
- Asignaturas.
- Evaluaciones.
- Objetivos de Aprendizaje.
- Calificaciones.
- Asistencia.
- Observaciones.
- Alertas.
- Seguimientos.
- Usuarios.
- Documentos.

También se evaluará el uso de datos semiestructurados para almacenar información cuya estructura pueda variar.

---

## 🖥️ Vistas principales

El sistema contempla inicialmente las siguientes vistas:

### 🏠 Inicio

Presentará un resumen general del estado de los estudiantes y de las alertas existentes.

### 👨‍🎓 Estudiantes

Permitirá buscar, listar y filtrar estudiantes según diferentes criterios.

### 🚨 Alertas

Permitirá revisar las alertas generadas por el sistema, su nivel y su evolución.

### 📋 Seguimiento

Permitirá trabajar con aquellos casos que requieran seguimiento.

### 👤 Ficha del estudiante

Centralizará la información correspondiente a cada estudiante, incluyendo:

- Datos personales.
- Estado de alerta.
- Indicadores.
- Antecedentes.
- Observaciones.
- Documentos.
- Seguimiento.
- Argumentación generada por el sistema.

---

## 🛠️ Tecnologías

Las tecnologías consideradas actualmente para el desarrollo de ATEDA son:

### Frontend

- HTML
- CSS
- JavaScript

### Backend

- Node.js
- Express.js

### Base de datos

- PostgreSQL

### Inteligencia Artificial

- Modelo de Lenguaje (LLM) por definir.

Las tecnologías podrán modificarse durante el desarrollo si las necesidades del proyecto lo requieren.

---

## 🗂️ Estructura del proyecto

La estructura definitiva del repositorio será definida a medida que avance el desarrollo.

Inicialmente se contempla separar los componentes principales del sistema:

```text
ATEDA/
│
├── frontend/
├── backend/
├── database/
├── docs/
├── README.md
└── .gitignore

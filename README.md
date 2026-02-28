# CotiZen v2 – Cotizador de Servicios 
Programacion Computacional IV

Ingenieria en sistemas y redes informáticas

Fecha: 27 feb 2026

Nota: En el archivo extension.py hay una explicacion mas detallada sobre el proyecto

## Integrantes
- Diego Martin Lopez Moreno  
- Franklin Aldahir Portillo Flores  

---

## ¿Qué valor agregado tiene el uso de Web Components en su proyecto?

El uso de Web Components aporta modularidad, reutilización y encapsulamiento del código. En el proyecto se implementaron dos componentes personalizados:

- `<service-row>`: Representa cada fila de servicio dentro del formulario.
- `<quote-card>`: Representa la tarjeta visual de la cotización generada.

El componente `service-row` utiliza Shadow DOM, lo que permite encapsular estilos y estructura interna sin afectar el resto del documento. Esto evita conflictos de CSS y mejora la mantenibilidad.

El componente `quote-card` permite renderizar dinámicamente la cotización final a partir de atributos y datos enviados desde la lógica principal. Esto facilita reutilizar la tarjeta en otros contextos sin modificar su estructura interna.


---

## ¿De qué forma manipularon los datos sin recargar la página?

La manipulación de datos se realizó completamente en el lado del cliente utilizando JavaScript moderno y eventos del DOM.

Se utilizó:

- `addEventListener` para capturar eventos como `submit`, `click` e `input`.
- `preventDefault()` para evitar que el formulario recargue la página al enviarse.
- Creación dinámica de elementos con `document.createElement()`.
- Actualización del DOM usando `appendChild()` e `innerHTML`.
- Uso de atributos personalizados en `<quote-card>` para actualizar su contenido dinámicamente.
- Manejo de estado interno mediante variables como `quoteCounter` e `history`.

Cuando el usuario genera una cotización:
1. Se validan los datos.
2. Se recopilan los servicios desde cada `<service-row>`.
3. Se crea dinámicamente un `<quote-card>`.
4. Se renderiza la vista previa sin recargar la página.

Esto convierte la aplicación en una SPA ligera (Single Page Application) sin necesidad de frameworks externos.

---

## ¿De qué forma validaron las entradas de datos? Expliquen brevemente

La validación se realizó en dos niveles:

### 1. Validación de campos principales
Se validaron campos como:
- Nombre del cliente
- Sector

Se utilizó una función `validateField()` que:
- Verifica si el campo está vacío.
- Agrega la clase `error` si no cumple la condición.
- Muestra mensajes visuales de error.
- Elimina el error cuando el usuario corrige el campo (validación en tiempo real).

### 2. Validación en cada Web Component `<service-row>`

Cada fila tiene su propio método `validate()` que:
- Verifica que la descripción no esté vacía.
- Verifica que el precio sea un número válido y no negativo.
- Marca visualmente los campos incorrectos.
- Retorna un booleano para controlar el flujo del formulario.

El formulario solo se procesa si:
- Todos los campos principales son válidos.
- Todas las filas de servicio son válidas.
- Existe al menos un servicio agregado.

Esto garantiza integridad y coherencia de los datos antes de generar la cotización.

---

## ¿Cómo manejaría la escalabilidad futura en su página?

Para manejar la escalabilidad futura del sistema se podrían aplicar las siguientes mejoras:

### 1. Separación por módulos
Dividir la lógica en archivos ES Modules:
- services.js
- validation.js
- history.js
- components/

Esto facilitaría el mantenimiento y crecimiento del proyecto.

### 2. Persistencia de datos
Implementar:
- LocalStorage para guardar historial.
- Backend con API REST para almacenar cotizaciones en base de datos.

### 3. Migración a arquitectura más robusta
En caso de crecimiento:
- Integrar un framework como React, Vue o Svelte.
- Convertir el proyecto en una SPA formal con enrutamiento.

### 4. Escalabilidad visual y funcional
- Exportación a PDF.
- Sistema de usuarios.
- Panel administrativo.
- Filtros avanzados de historial.
- Paginación si el historial crece significativamente.

### 5. Buenas prácticas ya aplicadas
El uso de:
- Web Components
- Encapsulamiento
- Separación de responsabilidades
- Validaciones independientes por componente

ya proporciona una base sólida para escalar sin reescribir completamente el sistema.

---

## Conclusión

El proyecto CotiZen v2 fue desarrollado aplicando principios modernos de desarrollo web como Web Components, manipulación dinámica del DOM y validación estructurada del lado del cliente. 

Se implemento una solución organizada, modular y preparada para crecimiento futuro, manteniendo una experiencia fluida sin recargas de página.

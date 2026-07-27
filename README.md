# YouTube to MP3 Converter

Una aplicación de escritorio moderna y rápida para descargar y convertir videos de YouTube a formato MP3. 

Este proyecto está construido con una arquitectura dividida donde el cliente y el servidor se comunican localmente, y luego se empaquetan en un único archivo ejecutable (`.exe`) para Windows, eliminando la necesidad de configuraciones complejas por parte del usuario final.

## Tecnologías Utilizadas

| Componente | Tecnología |
| :--- | :--- |
| **Frontend** | Angular |
| **Backend** | Node.js, Express |
| **Escritorio** | Electron, electron-builder |
| **Motor de Descarga** | yt-dlp-exec |
| **Procesamiento de Audio** | ffmpeg-static |

## Estructura del Proyecto

El código fuente está dividido en dos directorios principales:

*   **`front/`**: Contiene todo el código de la interfaz de usuario desarrollada en Angular.
*   **`back/`**: Contiene el servidor Express, la lógica de conversión, y la configuración de Electron para empaquetar la aplicación.

---

## Requisitos Previos

Asegúrate de tener instalados los siguientes programas en tu sistema antes de comenzar:

*   **Node.js** (v18 o superior recomendado)
*   **npm** (incluido con Node.js)
*   **Angular CLI** (opcional, pero recomendado para desarrollo frontend)

---

## Instalación y Entorno de Desarrollo

Sigue estos pasos para ejecutar la aplicación en tu entorno local (modo desarrollo):

1. **Clona el repositorio o descarga el código fuente.**
2. **Instala las dependencias del frontend:**
   Abre una terminal, navega a la carpeta `front` y ejecuta:
   `npm install`
3. **Instala las dependencias del backend:**
   Abre otra terminal, navega a la carpeta `back` y ejecuta:
   `npm install`
4. **Compila el frontend para pruebas locales:**
   Dentro de la carpeta `front`, ejecuta el comando de construcción de Angular:
   `ng build`
5. **Ejecuta el servidor de desarrollo:**
   Dentro de la carpeta `back`, inicia el servidor Node con:
   `npm start` (o `node index.js`)
6. **Abre la aplicación:**
   Puedes ver la interfaz navegando a `http://localhost:3000` en tu navegador, o ejecutando `npm run electron` en la carpeta `back` para abrir la ventana de escritorio.

---

## Compilación para Producción (crear el .exe)

Para generar el archivo ejecutable instalable para Windows, debes seguir un orden estricto para que Electron integre los archivos de Angular correctamente.

1. **Genera la versión final del frontend:**
   Navega a la carpeta `front` y ejecuta:
   `ng build`
2. **Empaqueta la aplicación con Electron:**
   Navega a la carpeta `back` y ejecuta:
   `npm run dist`
3. **Localiza tu instalador:**
   Una vez que termine el proceso, encontrarás tu archivo ejecutable `.exe` dentro de la carpeta `back/dist/`. 

---

## Notas de Funcionamiento Interno

*   **Gestión de Binarios:** La aplicación extrae de forma segura `yt-dlp.exe` y `ffmpeg.exe` fuera del archivo comprimido `app.asar` de Electron para evitar problemas de permisos nativos en Windows (`ENOENT`).
*   **Archivos Temporales:** Las conversiones se realizan utilizando el directorio temporal nativo del sistema operativo (`os.tmpdir()`). Esto garantiza que la aplicación no sufra bloqueos por falta de permisos de administrador al intentar escribir en disco.
*   **Autolimpieza:** Cualquier archivo descargado que no sea guardado por el usuario se elimina automáticamente del disco tras 10 minutos para ahorrar espacio.
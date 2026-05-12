# Guía rápida: SonarQube para el frontend SGFF

SonarQube analiza **calidad y seguridad** del código (bugs, code smells, duplicación, vulnerabilidades). No sustituye pruebas funcionales ni la revisión humana, pero encaja bien con ISO 9001 (procesos repetibles) e ISO/IEC 25010 (calidad del producto software).

## Opción A — SonarQube local con Docker (recomendada en equipo)

### 1. Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución.

### 2. Levantar el servidor SonarQube

En la carpeta del frontend:

```powershell
docker compose -f docker-compose.sonar.yml up -d
```

Abre **http://localhost:9000**. La primera vez te pedirá cambiar la contraseña del usuario `admin`.

### 3. Crear un proyecto y un token

1. Inicia sesión en SonarQube.
2. **Create project** → **Local project** → nombre, por ejemplo `SGFF Frontend`.
3. **My account** (avatar) → **Security** → **Generate token** (nombre: `frontend-ci`) y copia el token.

### 4. Analizar este repositorio con SonarScanner (Docker)

Desde la raíz del frontend (donde está `sonar-project.properties`), sustituye `TU_TOKEN`:

```powershell
docker run --rm `
  -e SONAR_HOST_URL="http://host.docker.internal:9000" `
  -e SONAR_TOKEN="TU_TOKEN" `
  -v "${PWD}:/usr/src" `
  sonarsource/sonar-scanner-cli:latest
```

En Linux/Mac suele usarse `http://localhost:9000` en lugar de `host.docker.internal` si la red Docker lo permite.

Cuando termine, verás el informe en la interfaz web del proyecto (issues, cobertura si la configuras, etc.).

### 5. Apagar SonarQube

```powershell
docker compose -f docker-compose.sonar.yml down
```

Los datos persisten en el volumen Docker hasta que lo borres.

---

## Opción B — SonarCloud (sin servidor propio)

1. Crea una cuenta en [SonarCloud](https://sonarcloud.io/).
2. Importa el repositorio (GitHub/GitLab/Bitbucket).
3. Sigue el asistente: te dará un **token** y los valores de `sonar.organization` y `sonar.projectKey` para añadir a `sonar-project.properties` o a variables de entorno en CI.

Ventaja: no mantienes servidor. Desventaja: proyecto público en plan gratuito salvo condiciones del proveedor.

---

## Cobertura de pruebas (opcional)

El archivo `sonar-project.properties` incluye una línea comentada para **LCOV**. Si añades tests (por ejemplo Vitest) y generas `coverage/lcov.info`, descomenta:

```properties
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

Así SonarQube mostrará **cobertura** además de calidad estática.

---

## Integración con ISO 25010 (idea práctica)

- **Adecuación funcional**: pruebas manuales / automatizadas de flujos (registro federación, equipos, reportes).
- **Fiabilidad / mantenibilidad**: SonarQube sobre el código + revisiones de PR.
- **Seguridad**: reglas de SonarQube + dependencias actualizadas (`npm audit`).

Si tu cátedra exige evidencias, guarda **capturas del dashboard** de SonarQube y el **log del scanner** en la entrega.

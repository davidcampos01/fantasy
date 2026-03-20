# Fantasy Liga 💸

App para gestionar las deudas de tu grupo de fantasy fútbol.

## Funcionalidades
- **Jornadas**: Registra quién quedó último (paga 2,50€) y penúltimo (paga 2€) cada semana. Opcionalmente guarda quién fue primero.
- **Ranking**: Ve quién ha quedado más veces último/penúltimo y quién más veces primero.
- **Deudas**: Resumen de lo que debe cada jugador, registro de pagos y saldo pendiente.
- Los datos se guardan automáticamente en el dispositivo (localStorage).

## Cómo desplegar en Vercel

### Opción 1: GitHub + Vercel (recomendado)

1. Crea un repositorio en GitHub y sube el código:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TU_USUARIO/fantasy-liga.git
   git push -u origin main
   ```

2. Ve a [vercel.com](https://vercel.com), regístrate con GitHub.

3. Haz clic en **"Add New Project"**, selecciona tu repositorio.

4. Vercel detecta Next.js automáticamente. Haz clic en **Deploy**.

5. En ~2 minutos tienes tu URL (ej: `fantasy-liga.vercel.app`).

### Opción 2: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

## Instalar en iPhone como app

1. Abre la URL en Safari en tu iPhone.
2. Pulsa el botón **Compartir** (cuadrado con flecha).
3. Selecciona **"Añadir a la pantalla de inicio"**.
4. Ponle nombre y pulsa **Añadir**.

¡Ya tienes la app en tu iPhone como si fuera nativa!

## Personalizar jugadores

Edita el archivo `lib/data.ts` y cambia el array `DEFAULT_PLAYERS`:

```ts
export const DEFAULT_PLAYERS: Player[] = [
  "Nombre1", "Nombre2", "Nombre3", ...
];
```

## Estructura

```
app/
  page.tsx         — Componente principal
  page.module.css  — Estilos
  layout.tsx       — Layout y metadatos
  globals.css      — Variables CSS globales
lib/
  data.ts          — Tipos y lógica de cálculo
public/
  manifest.json    — Configuración PWA
```

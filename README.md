# Todo List SBAA

AI-powered task management, built on the ReadyLoop SDK.

Deployed at https://todo.readyloop.ai

## Local development

1. Create `.env.local`:
   ```
   VITE_APP_KEY=sbaa_<your-key>
   VITE_API_URL=https://auriga.readyloop-staging.dev
   ```

2. Install and run:
   ```
   npm install
   npm run dev
   ```

3. Open http://localhost:5173

## Customization

- `src/config.ts` -- app name, tagline
- `src/theme.css` -- colors via --rl-* CSS custom properties
- `src/sbaa.css` -- login, header, subscribe page styles
- `src/pages/ChatPage.tsx` -- chat EmptyState slot

## Deployment

Push to main. GitHub Actions builds and deploys to GitHub Pages.

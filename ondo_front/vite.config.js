import { defineConfig, loadEnv } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      react(),
      svgr(),
      createHtmlPlugin({
        inject: {
          data: {
            VITE_KAKAO_MAP: env.VITE_KAKAO_MAP,
          },
        },
      }),
    ],
  };
});
import reactRefresh from '@vitejs/plugin-react-refresh';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  base: '/reactDemo/',
  css: {
    modules: {
      scopeBehaviour: 'local',
      generateScopedName: function (name, filename, css) {
        var i = css.indexOf('.' + name);
        var line = css.substr(0, i).split(/[\r\n]/).length;
        var file = path.basename(filename, '.css');
        return '_' + file + '_' + line + '_' + name;
      },
      hashPrefix: 'prefix',
    },
    preprocessorOptions: {
      scss: {
        
      }
    }
  },
});

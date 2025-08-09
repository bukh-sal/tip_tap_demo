import { resolve } from 'path'

export default {
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        list: resolve(__dirname, 'list.html'),
        at_root: resolve(__dirname, 'at_root.html'),
        wc_w_shadow: resolve(__dirname, 'wc_w_shadow.html'),
        wc_no_shadow: resolve(__dirname, 'wc_no_shadow.html'),
      }
    }
  }
}
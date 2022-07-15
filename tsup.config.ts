import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  format: [
<<<<<<< HEAD
    'esm'
=======
    'esm',
    "cjs"
>>>>>>> 0.0.7
  ],
  dts: true,
  clean: true,
  splitting: true,
})
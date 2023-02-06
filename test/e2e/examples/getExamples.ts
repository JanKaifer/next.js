const testedExamples = [
  // Internal features
  'active-class-name',
  'amp',
  'amp-first',
  'amp-story',
  'api-routes',
  'api-routes-cors',
  'api-routes-middleware',
  'api-routes-rate-limit',
  'api-routes-rest',
  'app-dir-i18n-routing',
  'app-dir-mdx',
  'basic-css',
  'basic-export',
  'blog',
  'blog-starter',
  'catch-all-routes',
  'custom-routes-proxying',
  'custom-server',
  'data-fetch',
  'dynamic-routing',
  'environment-variables',
  'fast-refresh-demo',
  'head-elements',
  'headers',
  'hello-world',
  'hello-world-esm',
  'i18n-routing',
  'image-component',
  'image-legacy-component',
  'layout-component',
  'middleware',
  'middleware-matcher',
  'modularize-imports',
  'nested-components',
  'next-css',
  'next-forms',
  'progressive-render',
  'redirects',
  'remove-console',
  'reproduction-template',
  'rewrites',
  'script-component',
  'ssr-caching',
  'styled-jsx-with-csp',
  'svg-components',
  'using-router',
  'with-absolute-imports',
  'with-app-layout',
  'with-context-api',
  'with-env-from-next-config-js',
  'with-loading',
  'with-shallow-routing',
  'with-sitemap',
  'with-typescript',
  'with-typescript-types',
  'with-web-worker',
  'with-webassembly',

  // Library integrations that we can't break
  'with-jest',
  'with-jest-babel',
  'with-mdx',
  'with-mdx-remote',
  'with-tailwindcss',
  'with-turbopack',
  'with-vercel-fetch',
  // TODO: remove slice()
  // We can't add all of them at once because the CI will timeout (because it will add all examples into one action)
].slice(0, 20)

const batches = 5
const batchSize = Math.floor((testedExamples.length + batches - 1) / batches)
/**
 * We need to split examples into multiple files because otherwise our --timings magic won't be able to splid our tests into mulpitle actions
 */
export const getExamplesBatch = (n: number) =>
  testedExamples.slice(
    n * batchSize,
    Math.min(testedExamples.length, (n + 1) * batchSize)
  )

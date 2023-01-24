import path from 'path'
import { createNextDescribe } from 'e2e-utils'

import { startStaticServer } from 'next-test-utils'
import { AddressInfo, Server } from 'net'

import ssr from './ssr'
import browser from './browser'
import dev from './dev'
import dynamic from './dynamic'
import apiRoutes from './api-routes'

const files = path.join(__dirname, '..')

createNextDescribe(
  'static export',
  {
    files,
  },
  ({ next }) => {
    const outdir = 'out'
    const outNoTrailSlash = 'outNoTrailSlash'
    let server: Server
    let serverNoTrailSlash: Server

    beforeAll(async () => {
      const nextConfigPath = 'next.config.js'

      await next.stop()

      const nextConfig = await next.readFile(nextConfigPath)
      await next.build()
      await next.export({ outdir })

      await next.patchFile(
        nextConfigPath,
        nextConfig.replace(`trailingSlash: true`, `trailingSlash: false`)
      )
      await next.build()
      await next.export({ outdir: outNoTrailSlash })
      await next.patchFile(nextConfigPath, nextConfig)

      server = await startStaticServer(path.join(next.testDir, outdir))
      serverNoTrailSlash = await startStaticServer(
        path.join(next.testDir, outNoTrailSlash)
      )
    })

    afterAll(async () => {
      await Promise.all([
        new Promise((resolve) => server.close(resolve)),
        new Promise((resolve) => serverNoTrailSlash.close(resolve)),
      ])
    })

    it('should delete existing exported files', async () => {
      const tmpOutDir = 'tmpOutDir'
      const tempfile = path.join(tmpOutDir, 'temp.txt')
      await next.patchFile(tempfile, 'test')
      await next.build()
      await next.export({ outdir: tmpOutDir })
      await expect(next.readFile(tempfile)).rejects.toThrowError()
    })

    const fileExist = async (file: string) =>
      await next
        .readFile(file)
        .then(() => true)
        .catch(() => false)

    it('should honor trailingSlash for 404 page', async () => {
      expect(await fileExist(path.join(outdir, '404/index.html'))).toBe(true)

      // we still output 404.html for backwards compat
      expect(await fileExist(path.join(outdir, '404.html'))).toBe(true)
    })

    it('should handle trailing slash in getStaticPaths', async () => {
      expect(await fileExist(path.join(outdir, 'gssp/foo/index.html'))).toBe(
        true
      )

      expect(await fileExist(path.join(outNoTrailSlash, 'gssp/foo.html'))).toBe(
        true
      )
    })

    it('should only output 404.html without trailingSlash', async () => {
      expect(
        await fileExist(path.join(outNoTrailSlash, '404/index.html'))
      ).toBe(false)

      expect(await fileExist(path.join(outNoTrailSlash, '404.html'))).toBe(true)
    })

    it('should not duplicate /index with trailingSlash', async () => {
      expect(await fileExist(path.join(outdir, 'index/index.html'))).toBe(false)

      expect(await fileExist(path.join(outdir, 'index.html'))).toBe(true)
    })

    // ssr(context)
    // browser(context)
    // dev(devContext)
    // dynamic(context)

    describe('API routes export', () => {
      it('Should throw if a route is matched', async () => {
        const nextConfigPath = 'next.config.js'
        const nextConfig = await next.readFile(nextConfigPath)
        await next.patchFile(
          nextConfigPath,
          nextConfig.replace('// API route', `'/data': { page: '/api/data' },`)
        )
        const outdir = 'outApi'
        await next.build()
        const { cliOutput } = await next.export({ outdir })
        await next.patchFile(nextConfigPath, nextConfig)

        expect(cliOutput).toContain(
          'https://nextjs.org/docs/messages/api-routes-static-export'
        )
      })
    })
  }
)

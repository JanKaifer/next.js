import { defineRule } from '../utils/define-rule'
import * as path from 'path'
import * as fs from 'fs'

const url =
  'https://nextjs.org/docs/messages/no-before-interactive-script-outside-document'

export = defineRule({
  meta: {
    docs: {
      description:
        "Prevent usage of `next/script`'s `beforeInteractive` strategy outside of root `layout.js`.",
      recommended: true,
      url,
    },
    type: 'problem',
    schema: [],
  },
  create(context) {
    let scriptImportName = null

    return {
      'ImportDeclaration[source.value="next/script"] > ImportDefaultSpecifier'(
        node
      ) {
        scriptImportName = node.local.name
      },
      JSXOpeningElement(node) {
        // Only check files in the app directory
        if (!context.getFilename().startsWith('app' + path.sep)) {
          return
        }

        if (!scriptImportName) {
          return
        }

        if (node.name && node.name.name !== scriptImportName) {
          return
        }

        const strategy = node.attributes.find(
          (child) => child.name && child.name.name === 'strategy'
        )

        if (
          !strategy ||
          !strategy.value ||
          strategy.value.value !== 'beforeInteractive'
        ) {
          return
        }

        let isRootLayout = true

        const filename = context.getFilename()
        const basename = path.basename(filename)
        if (basename.startsWith('layout.')) {
          const segments = filename.split(path.sep)
          segments.pop() // remove basename

          while (segments.length > 0) {
            segments.pop()
            const layoutPath = path.join(...segments, basename)
            try {
              fs.accessSync(layoutPath)
              isRootLayout = false
              break
            } catch {}
          }
        }

        if (isRootLayout) return

        context.report({
          node,
          message: `\`next/script\`'s \`beforeInteractive\` strategy should not be used outside of root \`layout.js\`. See: ${url}`,
        })
      },
    }
  },
})

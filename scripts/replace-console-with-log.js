/**
 * Replaces console.log/error/warn with log.info/error/warn
 * and auto-imports `log` from "@/lib/logger" if needed.
 */

module.exports = function transformer(file, api) {
  const j = api.jscodeshift
  const root = j(file.source)

  let didReplace = false

  // Replace console.xxx(...)
  root
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        object: { name: 'console' },
      },
    })
    .forEach(path => {
      const method = path.node.callee.property.name

      const map = {
        log: 'info',
        error: 'error',
        warn: 'warn',
      }

      if (!map[method]) return

      path.node.callee = j.memberExpression(
        j.identifier('log'),
        j.identifier(map[method])
      )

      didReplace = true
    })

  if (!didReplace) return root.toSource()

  // Check if log is already imported
  const hasLogImport = root
    .find(j.ImportDeclaration)
    .some(
      p =>
        p.node.source.value === '@/lib/logger' &&
        p.node.specifiers.some(s => s.imported && s.imported.name === 'log')
    )

  if (!hasLogImport) {
    const importDecl = j.importDeclaration(
      [j.importSpecifier(j.identifier('log'))],
      j.literal('@/lib/logger')
    )

    const firstImport = root.find(j.ImportDeclaration).at(0)
    if (firstImport.size()) {
      firstImport.insertBefore(importDecl)
    } else {
      root.get().node.program.body.unshift(importDecl)
    }
  }

  return root.toSource({ quote: 'single' })
}

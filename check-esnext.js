const fs = require('fs')
const path = require('path')

// 需要排查的语法特征（可根据需要补充）
const patterns = [
  /\?\./,            // 可选链
  /\?\?/,            // 空值合并
  /\bclass\s+\w+\s*{[^}]*\w+\s*=\s*[^;}]+[;}]/, // 类字段
  /\bimport\s*\(/,   // 动态 import()
  /\bexport\s+\*/,   // export *
]

const nodeModules = path.resolve(__dirname, 'node_modules')

function scanDir(dir, results = {}) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      // 只检查 package 内部的 "dist"、"lib"、"esm"、"src"
      if (/node_modules[\\/][^\\/]+/.test(fullPath)) {
        scanDir(fullPath, results)
      }
    } else if (/\.(js|mjs|cjs)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8')
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          const match = fullPath.split('node_modules')[1].split(path.sep)[1]
          results[match] = true
        }
      }
    }
  }
  return results
}

console.log('正在扫描 node_modules，查找可能包含 ESNext 语法的依赖...')
const results = scanDir(nodeModules)
console.log('\n⚠️  发现可能需要转译的依赖：')
console.log(Object.keys(results).length ? Object.keys(results) : '✅ 暂无问题')

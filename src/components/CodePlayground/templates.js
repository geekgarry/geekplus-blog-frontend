/**
 * 代码演练场：模式选项与默认示例。
 * 可运行类通过 CDN 在 iframe 中执行；标记/JSON 等做渲染或格式化预览。
 */

export const MODE_OPTIONS = [
  { value: 'html', label: 'HTML', aceLang: 'html', group: '可运行' },
  { value: 'javascript', label: 'JavaScript', aceLang: 'javascript', group: '可运行' },
  { value: 'css', label: 'HTML + CSS', aceLang: 'html', group: '可运行' },
  { value: 'vue', label: 'Vue 2', aceLang: 'html', group: '可运行' },
  { value: 'vue3', label: 'Vue 3', aceLang: 'html', group: '可运行' },
  { value: 'react', label: 'React', aceLang: 'javascript', group: '可运行' },
  { value: 'typescript', label: 'TypeScript', aceLang: 'typescript', group: '可运行' },
  { value: 'markdown', label: 'Markdown', aceLang: 'markdown', group: '预览' },
  { value: 'json', label: 'JSON', aceLang: 'json', group: '预览' },
]

export const TEMPLATES = {
  html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>HTML</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; color: #1f2937; }
    .card { max-width: 420px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
    button { margin-top: 12px; padding: 8px 14px; border: 0; border-radius: 6px; background: #2563eb; color: #fff; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Hello HTML</h2>
    <p id="msg">点击按钮试试。</p>
    <button id="btn" type="button">点我</button>
  </div>
  <script>
    var n = 0
    document.getElementById('btn').onclick = function () {
      n += 1
      document.getElementById('msg').textContent = '已点击 ' + n + ' 次'
    }
  </script>
</body>
</html>
`,

  javascript: `// 纯 JS：输出写到页面 #out
function fib(n) {
  if (n < 2) return n
  return fib(n - 1) + fib(n - 2)
}

var out = document.getElementById('out')
out.innerHTML = '<h3>Fibonacci</h3>'
for (var i = 0; i <= 10; i++) {
  out.innerHTML += '<div>fib(' + i + ') = ' + fib(i) + '</div>'
}
`,

  css: `<div class="hero">
  <h1>HTML + CSS</h1>
  <p>改左边样式即可看到效果。</p>
</div>

<style>
  body { margin: 0; font-family: system-ui, sans-serif; }
  .hero {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, #0ea5e9, #6366f1);
    color: #fff;
    text-align: center;
  }
  h1 { margin: 0 0 8px; font-size: clamp(28px, 8vw, 48px); }
</style>
`,

  vue: `<!-- Vue 2 CDN -->
<div id="app" class="wrap">
  <h2>{{ title }}</h2>
  <p>计数：{{ count }}</p>
  <button type="button" @click="count++">+1</button>
</div>

<style>
  .wrap { font-family: system-ui, sans-serif; margin: 24px; }
  button { padding: 8px 14px; border: 0; border-radius: 6px; background: #42b983; color: #fff; }
</style>

<script>
new Vue({
  el: '#app',
  data: { title: 'Hello Vue 2', count: 0 }
})
</script>
`,

  vue3: `<!-- Vue 3 CDN（Composition API） -->
<div id="app" class="wrap">
  <h2>{{ title }}</h2>
  <p>计数：{{ count }}</p>
  <button type="button" @click="count++">+1</button>
</div>

<style>
  .wrap { font-family: system-ui, sans-serif; margin: 24px; }
  button { padding: 8px 14px; border: 0; border-radius: 6px; background: #42b883; color: #fff; }
</style>

<script>
const { createApp, ref } = Vue
createApp({
  setup() {
    const title = ref('Hello Vue 3')
    const count = ref(0)
    return { title, count }
  }
}).mount('#app')
</script>
`,

  react: `/** React 18 + Babel（JSX） */
function App() {
  const [count, setCount] = React.useState(0)
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', margin: 24 }}>
      <h2>Hello React</h2>
      <p>计数：{count}</p>
      <button
        type="button"
        style={{ padding: '8px 14px', border: 0, borderRadius: 6, background: '#61dafb' }}
        onClick={() => setCount(count + 1)}
      >+1</button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
`,

  typescript: `// TypeScript → Babel 转译后运行
type User = { name: string; score: number }

function greet(u: User): string {
  return u.name + ' 得分 ' + u.score
}

const user: User = { name: 'Geek', score: 100 }
const el = document.getElementById('out')
if (el) el.textContent = greet(user)
`,

  markdown: `# Markdown 预览

支持 **加粗**、*斜体*、\`代码\` 与列表：

- 一项
- 二项

\`\`\`js
console.log('hello')
\`\`\`
`,

  json: `{
  "name": "geekplus",
  "version": "3.0.0",
  "features": ["blog", "admin", "generator"],
  "ok": true
}
`,
}

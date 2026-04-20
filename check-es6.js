const fs = require("fs");
const path = require("path");

const distPath = path.resolve(__dirname, "dist/static/js");

// 找到 vendors.*.js 文件
const vendorFile = fs.readdirSync(distPath).find(f => f.startsWith("vendors") && f.endsWith(".js"));

if (!vendorFile) {
  console.error("❌ 没找到 vendors.*.js 文件，请先执行 build");
  process.exit(1);
}

const filePath = path.join(distPath, vendorFile);
const code = fs.readFileSync(filePath, "utf-8");

console.log(`🔍 正在检查文件: ${vendorFile}`);

// 常见 ES6+ 语法特征
const patterns = {
  "箭头函数 (=>)": /=>/,
  "类 class": /\bclass\s+[A-Z]/,
  "let 声明": /\blet\s+/,
  "const 声明": /\bconst\s+/,
  "async/await": /\basync\s+function|\bawait\b/,
  "展开运算符 ...": /\.{3}[a-zA-Z_$][\w$]*/,
  "模板字符串": /`[^`]*\${[^}]+}[^`]*`/
};

let hasES6 = false;

// 将 vendors.js 按行拆分，方便定位
const lines = code.split("\n");

lines.forEach((line, i) => {
  for (const [desc, regex] of Object.entries(patterns)) {
    if (regex.test(line)) {
      hasES6 = true;

      // 提取大致的包名 (webpack 打包时会保留注释 /* node_modules/xxx */)
      const match = line.match(/node_modules\/([^/]+)/);
      const pkg = match ? match[1] : "未知依赖";

      console.log(
        `⚠️  [${desc}] 第 ${i + 1} 行，可能来源包: ${pkg}`
      );
    }
  }
});

if (!hasES6) {
  console.log("✅ 未检测到明显 ES6+ 语法，可能是其他问题。");
}

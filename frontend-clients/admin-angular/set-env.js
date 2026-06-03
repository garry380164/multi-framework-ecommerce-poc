const fs = require('fs');
const path = require('path');

// 讀取並解析 .env 檔案的輔助函式
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    // 忽略註解與空行
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // 去除包圍的雙引號或單引號
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      env[key] = value;
    }
  });
  return env;
}

// 建立 src/environments 目錄 (如果它不存在的話)
const envDir = path.join(__dirname, 'src', 'environments');
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

// 載入開發環境與生產環境變數檔
const devEnv = parseEnvFile(path.join(__dirname, '.env'));
const prodEnv = parseEnvFile(path.join(__dirname, '.env.prod'));

// 系統環境變數優先，其次是檔案中的變數，最後是系統預設值
const devApiUrl = process.env['API_URL'] || devEnv['API_URL'] || 'http://localhost:5000';
const prodApiUrl = process.env['PROD_API_URL'] || process.env['API_URL'] || prodEnv['API_URL'] || 'https://api.your-production-domain.com';

// 生成 environment.ts (用於開發環境的 Angular environment)
const devEnvContent = `// 此檔案由 set-env.js 自動生成，請勿手動修改。
export const environment = {
  production: false,
  apiUrl: '${devApiUrl}'
};
`;

// 生成 environment.prod.ts (用於生產環境的 Angular environment)
const prodEnvContent = `// 此檔案由 set-env.js 自動生成，請勿手動修改。
export const environment = {
  production: true,
  apiUrl: '${prodApiUrl}'
};
`;

// 寫入檔案
fs.writeFileSync(path.join(envDir, 'environment.ts'), devEnvContent, 'utf-8');
fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), prodEnvContent, 'utf-8');

console.log('Angular environment 檔案已成功自動生成！');

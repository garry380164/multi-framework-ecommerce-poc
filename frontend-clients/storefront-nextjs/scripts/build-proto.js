const protobuf = require('protobufjs');
const fs = require('fs');
const path = require('path');

// 共享的 proto 檔案路徑
const protoPath = path.resolve(__dirname, '../../../backend-dotnet/src/WebApi/Protos/products.proto');
// 輸出前端的 JSON 描述檔路徑
const outputPath = path.resolve(__dirname, '../src/proto/products.json');

console.log(`正在讀取並解析 Protobuf 檔案: ${protoPath}`);

try {
  const root = new protobuf.Root();
  root.loadSync(protoPath);
  
  // 建立輸出的目錄 (如果不存在)
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 將描述檔轉換成 JSON 字串並寫入
  const jsonDescriptor = JSON.stringify(root.toJSON(), null, 2);
  fs.writeFileSync(outputPath, jsonDescriptor, 'utf8');

  console.log(`成功編譯 Protobuf 定義為 JSON 描述檔，儲存至: ${outputPath}`);
} catch (error) {
  console.error('編譯 Protobuf 檔案失敗:', error);
  process.exit(1);
}

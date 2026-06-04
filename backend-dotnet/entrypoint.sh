#!/bin/bash
# 確保掛載的持久化上傳資料夾存在
mkdir -p /data/uploads

# 若持久化資料夾中沒有初始圖片，則將打包在 Image 內的預設圖片複製過去
if [ ! -f /data/uploads/product-1.jpg ]; then
  echo "Initializing default upload assets in persistence volume..."
  cp -r /app/uploads_init/* /data/uploads/
fi

# 移除原本的 wwwroot/uploads 靜態目錄，並建立軟連結指向 /data/uploads
# 這樣之後程式讀寫 wwwroot/uploads 時會自動轉向持久化硬碟上
rm -rf /app/wwwroot/uploads
ln -s /data/uploads /app/wwwroot/uploads

# 執行 Web API
echo "Starting ASP.NET Core Web API..."
exec dotnet WebApi.dll

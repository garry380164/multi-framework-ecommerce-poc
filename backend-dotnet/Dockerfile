# 階段一：建置 SDK 環境
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 複製方案檔與專案檔進行相依性還原 (Restore)
COPY backend-dotnet.sln ./
COPY src/Domain/Domain.csproj src/Domain/
COPY src/Application/Application.csproj src/Application/
COPY src/Infrastructure/Infrastructure.csproj src/Infrastructure/
COPY src/WebApi/WebApi.csproj src/WebApi/
RUN dotnet restore backend-dotnet.sln

# 複製所有原始碼並編譯發布
COPY src/ src/
WORKDIR /src/src/WebApi
RUN dotnet publish WebApi.csproj -c Release -o /app/publish

# 階段二：運行階段環境
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# 建立備份資料夾，並將初始商品圖片備份至 /app/uploads_init
# 以便在容器初次啟動掛載 Volume 時，能將初始圖片複製過去
RUN mkdir -p /app/uploads_init && \
    cp -r /app/wwwroot/uploads/* /app/uploads_init/

# 複製 entrypoint.sh 啟動腳本
COPY entrypoint.sh .
# 處理 Windows CRLF 換行符號問題，並賦予執行權限
RUN sed -i -e 's/\r$//' entrypoint.sh && \
    chmod +x entrypoint.sh

# 設定 .NET 監聽 8080 埠口
ENV ASPNETCORE_URLS=http://+:8080
# 覆蓋 SQLite 連線字串，使其指向持久化掛載點 /data/app_v2.db
ENV ConnectionStrings__DefaultConnection="Data Source=/data/app_v2.db"

# 宣告 Volume 持久化掛載點
VOLUME /data

EXPOSE 8080
ENTRYPOINT ["./entrypoint.sh"]

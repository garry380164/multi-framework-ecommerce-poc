using System;
using System.Text;
using Application.Interfaces;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using WebApi.Merchant;
using WebApi.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. 註冊資料庫上下文 (使用 SQLite 進行輕量化本地開發，開箱即用)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=app_v2.db"));

// 註冊 HttpContext 存取器與當前使用者 Provider (用於自動審計)
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserProvider, CurrentUserProvider>();

// 2. 註冊多商家 Provider (Scoped 生命週期，使同一次請求內共用同一個商家上下文)
builder.Services.AddScoped<MerchantProvider>();
builder.Services.AddScoped<IMerchantProvider>(sp => sp.GetRequiredService<MerchantProvider>());

// 3. 註冊領域與基礎設施商業邏輯服務
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IOrderService, OrderService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 4. 配置 JWT 驗證機制 (用於保障後台管理介面安全性)
string secretKey = builder.Configuration["JwtSettings:Secret"] ?? "super_secret_key_showcase_portfolio_123456789";
var key = Encoding.ASCII.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // 本地測試免 HTTPS 開銷
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "CMS_WebAPI",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JwtSettings:Audience"] ?? "CMS_Clients",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// 5. 配置 CORS 以便多前端框架 (Next.js, Angular, Vue 3) 順利調用同一個 Web API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// 6. 資料庫自動初始化與測試資料 (Seed Data) 植入
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        DbInitializer.Initialize(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "啟動初始化資料庫時發生嚴重錯誤！");
    }
}

// Swagger 配置
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles(); // 啟用靜態檔案服務，以提供 wwwroot/uploads 中的圖片下載

app.UseCors("AllowAll");

// 確保驗證模組在管道前段執行
app.UseAuthentication();

// 7. 註冊多商家中介軟體 (置於 UseAuthentication 之後以利解析 JWT Claims 中的商家 ID)
app.UseMiddleware<MerchantMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.Run();

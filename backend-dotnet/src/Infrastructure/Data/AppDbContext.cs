using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

/// <summary>
/// 應用程式資料庫上下文 (實作多商家資料隔離與自動填入，以及自動審計欄位寫入)
/// </summary>
public class AppDbContext : DbContext
{
    private readonly IMerchantProvider _merchantProvider;
    private readonly ICurrentUserProvider _currentUserProvider;

    public AppDbContext(
        DbContextOptions<AppDbContext> options, 
        IMerchantProvider merchantProvider,
        ICurrentUserProvider currentUserProvider)
        : base(options)
    {
        _merchantProvider = merchantProvider;
        _currentUserProvider = currentUserProvider;
    }

    public DbSet<Merchant> Merchants => Set<Merchant>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductSpec> ProductSpecs => Set<ProductSpec>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<SystemAction> SystemActions => Set<SystemAction>();
    public DbSet<RoleAction> RoleActions => Set<RoleAction>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<VerificationCode> VerificationCodes => Set<VerificationCode>();
    public DbSet<Domain.Entities.File> Files => Set<Domain.Entities.File>();
    public DbSet<FilPur> FilPurs => Set<FilPur>();
    public DbSet<FilTyp> FilTyps => Set<FilTyp>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. 設定複合鍵或索引 (比照 schema.sql 設計)
        modelBuilder.Entity<User>()
            .HasIndex(u => new { u.MerchantId, u.Email })
            .IsUnique();

        modelBuilder.Entity<Category>()
            .HasIndex(c => c.MerchantId);

        modelBuilder.Entity<Product>()
            .HasIndex(p => p.MerchantId);

        modelBuilder.Entity<ProductSpec>()
            .HasIndex(ps => ps.ProductId);

        modelBuilder.Entity<Order>()
            .HasIndex(o => new { o.MerchantId, o.OrderDate });

        modelBuilder.Entity<SystemAction>()
            .HasIndex(a => a.Code)
            .IsUnique();

        modelBuilder.Entity<RoleAction>()
            .HasOne(ra => ra.Role)
            .WithMany()
            .HasForeignKey(ra => ra.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RoleAction>()
            .HasOne(ra => ra.SystemAction)
            .WithMany()
            .HasForeignKey(ra => ra.SystemActionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProductSpec>()
            .HasOne(ps => ps.Product)
            .WithMany(p => p.ProductSpecs)
            .HasForeignKey(ps => ps.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.ProductSpec)
            .WithMany()
            .HasForeignKey(oi => oi.ProductSpecId)
            .OnDelete(DeleteBehavior.SetNull);

        // 2. 設定多商家全域查詢過濾器 (Global Query Filters)
        modelBuilder.Entity<User>().HasQueryFilter(u => u.MerchantId == _merchantProvider.MerchantId);
        modelBuilder.Entity<Category>().HasQueryFilter(c => c.MerchantId == _merchantProvider.MerchantId);
        modelBuilder.Entity<Product>().HasQueryFilter(p => p.MerchantId == _merchantProvider.MerchantId);
        modelBuilder.Entity<Order>().HasQueryFilter(o => o.MerchantId == _merchantProvider.MerchantId && o.Status == "1");
        modelBuilder.Entity<CartItem>().HasQueryFilter(c => c.MerchantId == _merchantProvider.MerchantId);
        modelBuilder.Entity<VerificationCode>().HasQueryFilter(v => v.MerchantId == _merchantProvider.MerchantId);

        // 3. 設定外鍵刪除行為與額外關係設定
        modelBuilder.Entity<Order>()
            .HasOne(o => o.Merchant)
            .WithMany()
            .HasForeignKey(o => o.MerchantId)
            .OnDelete(DeleteBehavior.Restrict);

        // 購物車關聯設定與索引
        modelBuilder.Entity<CartItem>()
            .HasIndex(c => new { c.MerchantId, c.UserId });

        modelBuilder.Entity<CartItem>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CartItem>()
            .HasOne(c => c.Product)
            .WithMany()
            .HasForeignKey(c => c.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CartItem>()
            .HasOne(c => c.ProductSpec)
            .WithMany()
            .HasForeignKey(c => c.ProductSpecId)
            .OnDelete(DeleteBehavior.SetNull);

        // 驗證碼關聯設定與索引
        modelBuilder.Entity<VerificationCode>()
            .HasIndex(v => new { v.MerchantId, v.Email });

        // 檔案模組關係與外鍵配置 (繁體中文註解)
        modelBuilder.Entity<Domain.Entities.File>()
            .HasIndex(f => new { f.TargetId, f.FilPurId });

        modelBuilder.Entity<Domain.Entities.File>()
            .HasOne(f => f.FilPur)
            .WithMany()
            .HasForeignKey(f => f.FilPurId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Domain.Entities.File>()
            .HasOne(f => f.FilTyp)
            .WithMany()
            .HasForeignKey(f => f.FilTypId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    /// <summary>
    /// 重寫 SaveChangesAsync，在寫入資料庫前自動填入 MerchantId 與審計欄位
    /// </summary>
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyAuditAndMerchantInfo();
        return base.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// 重寫同步的 SaveChanges
    /// </summary>
    public override int SaveChanges()
    {
        ApplyAuditAndMerchantInfo();
        return base.SaveChanges();
    }

    /// <summary>
    /// 自動套用多商家隔離欄位與審計欄位
    /// </summary>
    private void ApplyAuditAndMerchantInfo()
    {
        var username = _currentUserProvider.Username ?? "System";
        var now = DateTime.UtcNow;

        // 1. 自動填入商家識別碼 (IMustHaveMerchant)
        foreach (var entry in ChangeTracker.Entries<IMustHaveMerchant>())
        {
            if (entry.State == EntityState.Added)
            {
                if (string.IsNullOrEmpty(entry.Entity.MerchantId))
                {
                    entry.Entity.MerchantId = _merchantProvider.MerchantId;
                }
            }
        }

        // 2. 自動填入審計欄位 (AuditableEntity)
        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = now;
                    entry.Entity.CreatedUser = username;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = now;
                    entry.Entity.UpdatedUser = username;
                    break;
            }
        }
    }
}

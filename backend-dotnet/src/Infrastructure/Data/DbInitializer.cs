using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using Domain.Entities;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

/// <summary>
/// 資料庫初始化與測試資料植入 (Seed Data)
/// </summary>
public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        // 1. 確保資料庫重新建立以更新欄位結構 (SQLite 本地開發模式)
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();


        // 2. 清空舊有資料以套用全新資料結構 (避免因為檔案被 IDE 鎖定而無法刪除檔案)
        context.Database.ExecuteSqlRaw("PRAGMA foreign_keys = OFF;");
        context.Database.ExecuteSqlRaw("DELETE FROM \"OrderItems\";");
        context.Database.ExecuteSqlRaw("DELETE FROM \"Orders\";");
        context.Database.ExecuteSqlRaw("DELETE FROM \"ProductSpecs\";");
        context.Database.ExecuteSqlRaw("DELETE FROM \"Products\";");
        context.Database.ExecuteSqlRaw("DELETE FROM \"Categories\";");
        context.Database.ExecuteSqlRaw("DELETE FROM \"Users\";");
        context.Database.ExecuteSqlRaw("DELETE FROM \"Roles\";");
        context.Database.ExecuteSqlRaw("DELETE FROM \"Merchants\";");
        context.Database.ExecuteSqlRaw("DELETE FROM \"RoleActions\";");
        context.Database.ExecuteSqlRaw("DELETE FROM \"SystemActions\";");
        context.Database.ExecuteSqlRaw("DELETE FROM \"Files\";");
        context.Database.ExecuteSqlRaw("DELETE FROM \"FilPurs\";");
        context.Database.ExecuteSqlRaw("DELETE FROM \"FilTyps\";");
        context.Database.ExecuteSqlRaw("DELETE FROM \"RefreshTokens\";");
        context.Database.ExecuteSqlRaw("PRAGMA foreign_keys = ON;");

        // 2.5 植入檔案相關基礎對照資料 (繁體中文註解)
        var typeImg = new FilTyp { Id = 1, Name = "圖片" };
        var typeVid = new FilTyp { Id = 2, Name = "影片" };
        context.FilTyps.AddRange(typeImg, typeVid);

        var purProduct = new FilPur { Id = 1, Name = "商品圖片" };
        var purLogo = new FilPur { Id = 2, Name = "商家logo" };
        var purBanner = new FilPur { Id = 3, Name = "商家首頁banner" };
        context.FilPurs.AddRange(purProduct, purLogo, purBanner);
        context.SaveChanges();

        // 2.6 植入商家 Logo 檔案資料
        var idA = NanoIdHelper.Generate(); // 呼叫 NanoIdHelper 生成 21 字元唯一碼
        var idB = NanoIdHelper.Generate();

        var saveNameA = CopyToNanoIdPath("logo-store-a.png", idA); // 自動建立二層目錄並複製檔案
        var saveNameB = CopyToNanoIdPath("logo-store-b.png", idB);

        var logoA = new Domain.Entities.File
        {
            OriName = "logo-store-a.png",
            SaveName = saveNameA,
            TargetId = "store-a", // 商家 ID 通用關聯
            FileSize = 4520,
            Extension = ".png",
            FilPurId = purLogo.Id,
            FilTypId = typeImg.Id,
            Status = "1",
            Creator = "System"
        };
        var logoB = new Domain.Entities.File
        {
            OriName = "logo-store-b.png",
            SaveName = saveNameB,
            TargetId = "store-b", // 商家 ID 通用關聯
            FileSize = 4890,
            Extension = ".png",
            FilPurId = purLogo.Id,
            FilTypId = typeImg.Id,
            Status = "1",
            Creator = "System"
        };
        context.Files.AddRange(logoA, logoB);
        context.SaveChanges();

        // 3. 植入商家 (Merchants)
        var merchantA = new Merchant { Id = "store-a", Name = "極簡咖啡館 (Store A)", Domain = "coffee.local" };
        var merchantB = new Merchant { Id = "store-b", Name = "潮流服飾店 (Store B)", Domain = "apparel.local" };
        context.Merchants.AddRange(merchantA, merchantB);
        context.SaveChanges();

        // 4. 植入角色 (Roles)
        var roleSystemAdmin = new Role { Id = 1, Name = "SystemAdmin", Description = "系統管理員，可進行跨商家查詢與全功能管理" };
        var roleMerchantAdmin = new Role { Id = 2, Name = "MerchantAdmin", Description = "店家管理員，可管理所屬商家的商品、訂單與員工" };
        var roleMerchantStaff = new Role { Id = 3, Name = "MerchantStaff", Description = "店家店務人員，可管理所屬商家的商品與訂單，無員工管理權限" };
        var roleMember = new Role { Id = 4, Name = "Member", Description = "一般消費者，可於前台進行訂購" };
        context.Roles.AddRange(roleSystemAdmin, roleMerchantAdmin, roleMerchantStaff, roleMember);
        context.SaveChanges();

        // 5. 植入使用者 (Users)
        // 密碼預設設為 "password123"，我們使用簡單的 SHA256 加密
        string passwordHash = HashPassword("password123");

        var userSystemAdmin = new User
        {
            MerchantId = "store-a",
            Username = "SystemManager",
            Email = "system-admin@test.com",
            PasswordHash = passwordHash,
            RoleId = roleSystemAdmin.Id
        };

        var userAdminA = new User
        {
            MerchantId = "store-a",
            Username = "CoffeeManager",
            Email = "store-a-admin@test.com",
            PasswordHash = passwordHash,
            RoleId = roleMerchantAdmin.Id
        };

        var userStaffA = new User
        {
            MerchantId = "store-a",
            Username = "CoffeeStaff",
            Email = "store-a-staff@test.com",
            PasswordHash = passwordHash,
            RoleId = roleMerchantStaff.Id
        };

        var userAdminB = new User
        {
            MerchantId = "store-b",
            Username = "ApparelManager",
            Email = "store-b-admin@test.com",
            PasswordHash = passwordHash,
            RoleId = roleMerchantAdmin.Id
        };

        var userStaffB = new User
        {
            MerchantId = "store-b",
            Username = "ApparelStaff",
            Email = "store-b-staff@test.com",
            PasswordHash = passwordHash,
            RoleId = roleMerchantStaff.Id
        };

        // 模擬真實購買會員 (store-a)
        var userLimA = new User { MerchantId = "store-a", Username = "林志明", Email = "jimmy.lin@example.com", PasswordHash = passwordHash, RoleId = roleMember.Id };
        var userChenA = new User { MerchantId = "store-a", Username = "陳美玲", Email = "meiling.chen@example.com", PasswordHash = passwordHash, RoleId = roleMember.Id };
        var userWangA = new User { MerchantId = "store-a", Username = "王大同", Email = "datong.wang@example.com", PasswordHash = passwordHash, RoleId = roleMember.Id };
        var userChangA = new User { MerchantId = "store-a", Username = "張小華", Email = "xiaohua.zhang@example.com", PasswordHash = passwordHash, RoleId = roleMember.Id };

        // 模擬真實購買會員 (store-b)
        var userLimB = new User { MerchantId = "store-b", Username = "林志明", Email = "jimmy.lin@example.com", PasswordHash = passwordHash, RoleId = roleMember.Id };
        var userChenB = new User { MerchantId = "store-b", Username = "陳美玲", Email = "meiling.chen@example.com", PasswordHash = passwordHash, RoleId = roleMember.Id };
        var userWangB = new User { MerchantId = "store-b", Username = "王大同", Email = "datong.wang@example.com", PasswordHash = passwordHash, RoleId = roleMember.Id };
        var userChangB = new User { MerchantId = "store-b", Username = "張小華", Email = "xiaohua.zhang@example.com", PasswordHash = passwordHash, RoleId = roleMember.Id };

        context.Users.AddRange(
            userSystemAdmin, userAdminA, userStaffA, userAdminB, userStaffB,
            userLimA, userChenA, userWangA, userChangA,
            userLimB, userChenB, userWangB, userChangB
        );
        context.SaveChanges();

        // 5.5 植入商品分類 (Categories，繁體中文註解)
        var catCoffeeBean = new Category { MerchantId = "store-a", Name = "精選豆" };
        var catCoffeeUtensil = new Category { MerchantId = "store-a", Name = "器具" };
        var catCoffeeProject = new Category { MerchantId = "store-a", Name = "專案" };

        var catApparel = new Category { MerchantId = "store-b", Name = "服飾" };
        var catBag = new Category { MerchantId = "store-b", Name = "包袋" };
        var catAccessory = new Category { MerchantId = "store-b", Name = "配件" };

        context.Categories.AddRange(catCoffeeBean, catCoffeeUtensil, catCoffeeProject, catApparel, catBag, catAccessory);
        context.SaveChanges();

        // 6. 植入商品 (Products)
        // Store A - 極簡咖啡館 (12 個商品，繁體中文註解)
        var idProd1 = NanoIdHelper.Generate();
        var saveProd1 = CopyToNanoIdPath("product-1.jpg", idProd1);
        var coffeeBean = new Product
        {
            MerchantId = "store-a",
            Name = "耶加雪菲精品咖啡豆 (250g)",
            Description = "帶有豐富的柑橘與花香調性，中淺烘焙，酸質明亮細緻。",
            Price = 450.00m,
            Stock = 120,
            ImageUrl = $"/uploads/{saveProd1}",
            CategoryId = catCoffeeBean.Id
        };

        var idProd2 = NanoIdHelper.Generate();
        var saveProd2 = CopyToNanoIdPath("product-2.jpg", idProd2);
        var mug = new Product
        {
            MerchantId = "store-a",
            Name = "極簡磨砂陶瓷馬克杯",
            Description = "質感磨砂黑，350ml 容量，保溫效果佳，辦公室必備。",
            Price = 350.00m,
            Stock = 85,
            ImageUrl = $"/uploads/{saveProd2}",
            CategoryId = catCoffeeUtensil.Id
        };

        var idProd3 = NanoIdHelper.Generate();
        var saveProd3 = CopyToNanoIdPath("product-3.jpg", idProd3);
        var coffeeBeanKenya = new Product
        {
            MerchantId = "store-a",
            Name = "肯亞 AA 精品咖啡豆 (250g)",
            Description = "黑莓與烏梅酸質明顯，層次感豐富，餘韻微帶焦糖甜感。",
            Price = 480.00m,
            Stock = 90,
            ImageUrl = $"/uploads/{saveProd3}",
            CategoryId = catCoffeeBean.Id
        };

        var idProd4 = NanoIdHelper.Generate();
        var saveProd4 = CopyToNanoIdPath("product-4.jpg", idProd4);
        var coffeeBeanMandheling = new Product
        {
            MerchantId = "store-a",
            Name = "曼特寧深烘焙咖啡豆 (250g)",
            Description = "傳統半濕剝除法處理，帶有強烈草本、雪松與黑巧克力風味，口感醇厚。",
            Price = 420.00m,
            Stock = 150,
            ImageUrl = $"/uploads/{saveProd4}",
            CategoryId = catCoffeeBean.Id
        };

        var idProd5 = NanoIdHelper.Generate();
        var saveProd5 = CopyToNanoIdPath("product-5.jpg", idProd5);
        var coffeeBeanColumbia = new Product
        {
            MerchantId = "store-a",
            Name = "哥倫比亞手沖精品咖啡豆 (250g)",
            Description = "經典蜜處理，帶有紅蘋果與焦糖香氣，酸甜感平衡，十分順口。",
            Price = 460.00m,
            Stock = 110,
            ImageUrl = $"/uploads/{saveProd5}",
            CategoryId = catCoffeeBean.Id
        };

        var idProd6 = NanoIdHelper.Generate();
        var saveProd6 = CopyToNanoIdPath("product-6.jpg", idProd6);
        var coffeeBeanGeisha = new Product
        {
            MerchantId = "store-a",
            Name = "巴拿馬藝妓精品咖啡豆 (250g)",
            Description = "頂級莊園藝妓，帶有極致的茉莉花香、檸檬皮與白葡萄調性，香氣悠長。",
            Price = 980.00m,
            Stock = 15,
            ImageUrl = $"/uploads/{saveProd6}",
            CategoryId = catCoffeeBean.Id
        };

        var idProd7 = NanoIdHelper.Generate();
        var saveProd7 = CopyToNanoIdPath("product-7.jpg", idProd7);
        var grinder = new Product
        {
            MerchantId = "store-a",
            Name = "手動不鏽鋼磨豆機",
            Description = "雙軸承固定設計，五軸不鏽鋼磨芯，研磨省力且粗細極為均勻。",
            Price = 850.00m,
            Stock = 30,
            ImageUrl = $"/uploads/{saveProd7}",
            CategoryId = catCoffeeUtensil.Id
        };

        var idProd8 = NanoIdHelper.Generate();
        var saveProd8 = CopyToNanoIdPath("product-8.jpg", idProd8);
        var kettle = new Product
        {
            MerchantId = "store-a",
            Name = "細口手沖壺 (600ml)",
            Description = "特製鶴嘴壺口，出水穩定流暢，食品級 304 不鏽鋼，握感極佳。",
            Price = 1200.00m,
            Stock = 25,
            ImageUrl = $"/uploads/{saveProd8}",
            CategoryId = catCoffeeUtensil.Id
        };

        var idProd9 = NanoIdHelper.Generate();
        var saveProd9 = CopyToNanoIdPath("product-9.jpg", idProd9);
        var dripperSet = new Product
        {
            MerchantId = "store-a",
            Name = "V60 陶瓷濾杯與濾紙套組",
            Description = "經典螺旋肋骨設計，萃取更完整。附 100 張無漂白日本濾紙。",
            Price = 550.00m,
            Stock = 60,
            ImageUrl = $"/uploads/{saveProd9}",
            CategoryId = catCoffeeUtensil.Id
        };

        var idProd10 = NanoIdHelper.Generate();
        var saveProd10 = CopyToNanoIdPath("product-10.jpg", idProd10);
        var scale = new Product
        {
            MerchantId = "store-a",
            Name = "極簡電子秤 (精準度 0.1g)",
            Description = "自帶計時功能，支援手沖自動偵測計時，觸控操作防潑水。",
            Price = 790.00m,
            Stock = 40,
            ImageUrl = $"/uploads/{saveProd10}",
            CategoryId = catCoffeeUtensil.Id
        };

        var idProd11 = NanoIdHelper.Generate();
        var saveProd11 = CopyToNanoIdPath("product-11.jpg", idProd11);
        var coffeeProjectMembership = new Product
        {
            MerchantId = "store-a",
            Name = "極簡咖啡館 16 期終身會員方案",
            Description = "加入終身會員，可獲得精選咖啡豆與專屬限量馬克杯一份！",
            Price = 6800.00m,
            Stock = 99,
            ImageUrl = $"/uploads/{saveProd11}",
            CategoryId = catCoffeeProject.Id
        };

        var idProd12 = NanoIdHelper.Generate();
        var saveProd12 = CopyToNanoIdPath("product-12.jpg", idProd12);
        var coffeeProjectCourse = new Product
        {
            MerchantId = "store-a",
            Name = "咖啡拉花入門教學課程 (單堂)",
            Description = "專業咖啡師一對一教學，從奶泡打法到經典心型、葉型拉花實作。",
            Price = 1500.00m,
            Stock = 50,
            ImageUrl = $"/uploads/{saveProd12}",
            CategoryId = catCoffeeProject.Id
        };

        // Store B - 潮流服飾店 (12 個商品，繁體中文註解)
        var idProd13 = NanoIdHelper.Generate();
        var saveProd13 = CopyToNanoIdPath("product-13.jpg", idProd13);
        var hoodie = new Product
        {
            MerchantId = "store-b",
            Name = "重磅落肩寬版連帽衫",
            Description = "420g 重磅純棉，寬鬆落肩版型，親膚保暖，美式街頭風格。",
            Price = 1280.00m,
            Stock = 45,
            ImageUrl = $"/uploads/{saveProd13}",
            CategoryId = catApparel.Id
        };

        var idProd14 = NanoIdHelper.Generate();
        var saveProd14 = CopyToNanoIdPath("product-14.jpg", idProd14);
        var toteBag = new Product
        {
            MerchantId = "store-b",
            Name = "日系原色帆布托特包",
            Description = "厚實耐磨帆布，附內部拉鍊小袋，大容量可裝 15 吋筆電。",
            Price = 590.00m,
            Stock = 110,
            ImageUrl = $"/uploads/{saveProd14}",
            CategoryId = catBag.Id
        };

        var idProd15 = NanoIdHelper.Generate();
        var saveProd15 = CopyToNanoIdPath("product-15.jpg", idProd15);
        var windbreaker = new Product
        {
            MerchantId = "store-b",
            Name = "極簡機能防風外套",
            Description = "防潑水機能面料，俐落版型，適合城市通勤與戶外穿搭。",
            Price = 2480.00m,
            Stock = 20,
            ImageUrl = $"/uploads/{saveProd15}",
            CategoryId = catApparel.Id
        };

        var idProd16 = NanoIdHelper.Generate();
        var saveProd16 = CopyToNanoIdPath("product-16.jpg", idProd16);
        var cap = new Product
        {
            MerchantId = "store-b",
            Name = "復古水洗老帽",
            Description = "水洗斜紋棉布，可調式金屬扣，呈現獨特復古洗舊質感。",
            Price = 450.00m,
            Stock = 80,
            ImageUrl = $"/uploads/{saveProd16}",
            CategoryId = catAccessory.Id
        };

        var idProd17 = NanoIdHelper.Generate();
        var saveProd17 = CopyToNanoIdPath("product-17.jpg", idProd17);
        var jeans = new Product
        {
            MerchantId = "store-b",
            Name = "日系水洗寬鬆牛仔褲",
            Description = "高品質日產單寧布，微錐寬鬆版型，水洗自然落色，復古感強。",
            Price = 1380.00m,
            Stock = 70,
            ImageUrl = $"/uploads/{saveProd17}",
            CategoryId = catApparel.Id
        };

        var idProd18 = NanoIdHelper.Generate();
        var saveProd18 = CopyToNanoIdPath("product-18.jpg", idProd18);
        var tshirtStriped = new Product
        {
            MerchantId = "store-b",
            Name = "條紋極簡純棉短T (黑白)",
            Description = "230g 雙紗精梳棉，領口雙針加固不變形，黑白條紋百搭款式。",
            Price = 690.00m,
            Stock = 120,
            ImageUrl = $"/uploads/{saveProd18}",
            CategoryId = catApparel.Id
        };

        var idProd19 = NanoIdHelper.Generate();
        var saveProd19 = CopyToNanoIdPath("product-19.jpg", idProd19);
        var tshirtSolid = new Product
        {
            MerchantId = "store-b",
            Name = "落肩純色寬版口袋短T",
            Description = "復古微高領，左胸貼袋設計，100% 精梳棉，休閒感十足。",
            Price = 590.00m,
            Stock = 150,
            ImageUrl = $"/uploads/{saveProd19}",
            CategoryId = catApparel.Id
        };

        var idProd20 = NanoIdHelper.Generate();
        var saveProd20 = CopyToNanoIdPath("product-20.jpg", idProd20);
        var pantsCargo = new Product
        {
            MerchantId = "store-b",
            Name = "厚磅工裝休閒九分褲",
            Description = "防撕裂格紋工裝面料，立體大貼袋，錐形九分裁剪修飾身形。",
            Price = 1180.00m,
            Stock = 55,
            ImageUrl = $"/uploads/{saveProd20}",
            CategoryId = catApparel.Id
        };

        var idProd21 = NanoIdHelper.Generate();
        var saveProd21 = CopyToNanoIdPath("product-21.jpg", idProd21);
        var backpack = new Product
        {
            MerchantId = "store-b",
            Name = "極簡防潑水後背包",
            Description = "Cordura 耐磨面料，內置 15.6 吋獨立筆電夾層，透氣減壓肩帶。",
            Price = 1880.00m,
            Stock = 40,
            ImageUrl = $"/uploads/{saveProd21}",
            CategoryId = catBag.Id
        };

        var idProd22 = NanoIdHelper.Generate();
        var saveProd22 = CopyToNanoIdPath("product-22.jpg", idProd22);
        var duffelBag = new Product
        {
            MerchantId = "store-b",
            Name = "潮流拼接手提行李包",
            Description = "大容量旅行設計，乾濕分離內袋，拼色機能美學設計。",
            Price = 1600.00m,
            Stock = 25,
            ImageUrl = $"/uploads/{saveProd22}",
            CategoryId = catBag.Id
        };

        var idProd23 = NanoIdHelper.Generate();
        var saveProd23 = CopyToNanoIdPath("product-23.jpg", idProd23);
        var beanie = new Product
        {
            MerchantId = "store-b",
            Name = "羊毛極簡冷帽 (針織帽)",
            Description = "細緻小標點綴，柔軟抗起球，保暖貼合，街頭穿搭利器。",
            Price = 390.00m,
            Stock = 85,
            ImageUrl = $"/uploads/{saveProd23}",
            CategoryId = catAccessory.Id
        };

        var idProd24 = NanoIdHelper.Generate();
        var saveProd24 = CopyToNanoIdPath("product-24.jpg", idProd24);
        var belt = new Product
        {
            MerchantId = "store-b",
            Name = "經典皮質針扣腰帶 (黑)",
            Description = "頭層牛皮打造，金屬復古扣頭，簡潔設計，兼顧正裝與休閒。",
            Price = 780.00m,
            Stock = 50,
            ImageUrl = $"/uploads/{saveProd24}",
            CategoryId = catAccessory.Id
        };

        context.Products.AddRange(
            coffeeBean, mug, coffeeBeanKenya, coffeeBeanMandheling, coffeeBeanColumbia, coffeeBeanGeisha,
            grinder, kettle, dripperSet, scale, coffeeProjectMembership, coffeeProjectCourse,
            hoodie, toteBag, windbreaker, cap, jeans, tshirtStriped, tshirtSolid, pantsCargo,
            backpack, duffelBag, beanie, belt
        );
        context.SaveChanges();

        // 6.5 註冊商品圖片至 Files 資料表 (檔案通用關聯，繁體中文註解)
        var fileProd1 = new Domain.Entities.File { OriName = "product-1.jpg", SaveName = saveProd1, TargetId = coffeeBean.Id.ToString(), FileSize = GetLocalFileSize("product-1.jpg"), Extension = Path.GetExtension("product-1.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd2 = new Domain.Entities.File { OriName = "product-2.jpg", SaveName = saveProd2, TargetId = mug.Id.ToString(), FileSize = GetLocalFileSize("product-2.jpg"), Extension = Path.GetExtension("product-2.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd3 = new Domain.Entities.File { OriName = "product-3.jpg", SaveName = saveProd3, TargetId = coffeeBeanKenya.Id.ToString(), FileSize = GetLocalFileSize("product-3.jpg"), Extension = Path.GetExtension("product-3.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd4 = new Domain.Entities.File { OriName = "product-4.jpg", SaveName = saveProd4, TargetId = coffeeBeanMandheling.Id.ToString(), FileSize = GetLocalFileSize("product-4.jpg"), Extension = Path.GetExtension("product-4.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd5 = new Domain.Entities.File { OriName = "product-5.jpg", SaveName = saveProd5, TargetId = coffeeBeanColumbia.Id.ToString(), FileSize = GetLocalFileSize("product-5.jpg"), Extension = Path.GetExtension("product-5.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd6 = new Domain.Entities.File { OriName = "product-6.jpg", SaveName = saveProd6, TargetId = coffeeBeanGeisha.Id.ToString(), FileSize = GetLocalFileSize("product-6.jpg"), Extension = Path.GetExtension("product-6.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd7 = new Domain.Entities.File { OriName = "product-7.jpg", SaveName = saveProd7, TargetId = grinder.Id.ToString(), FileSize = GetLocalFileSize("product-7.jpg"), Extension = Path.GetExtension("product-7.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd8 = new Domain.Entities.File { OriName = "product-8.jpg", SaveName = saveProd8, TargetId = kettle.Id.ToString(), FileSize = GetLocalFileSize("product-8.jpg"), Extension = Path.GetExtension("product-8.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd9 = new Domain.Entities.File { OriName = "product-9.jpg", SaveName = saveProd9, TargetId = dripperSet.Id.ToString(), FileSize = GetLocalFileSize("product-9.jpg"), Extension = Path.GetExtension("product-9.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd10 = new Domain.Entities.File { OriName = "product-10.jpg", SaveName = saveProd10, TargetId = scale.Id.ToString(), FileSize = GetLocalFileSize("product-10.jpg"), Extension = Path.GetExtension("product-10.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd11 = new Domain.Entities.File { OriName = "product-11.jpg", SaveName = saveProd11, TargetId = coffeeProjectMembership.Id.ToString(), FileSize = GetLocalFileSize("product-11.jpg"), Extension = Path.GetExtension("product-11.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd12 = new Domain.Entities.File { OriName = "product-12.jpg", SaveName = saveProd12, TargetId = coffeeProjectCourse.Id.ToString(), FileSize = GetLocalFileSize("product-12.jpg"), Extension = Path.GetExtension("product-12.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd13 = new Domain.Entities.File { OriName = "product-13.jpg", SaveName = saveProd13, TargetId = hoodie.Id.ToString(), FileSize = GetLocalFileSize("product-13.jpg"), Extension = Path.GetExtension("product-13.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd14 = new Domain.Entities.File { OriName = "product-14.jpg", SaveName = saveProd14, TargetId = toteBag.Id.ToString(), FileSize = GetLocalFileSize("product-14.jpg"), Extension = Path.GetExtension("product-14.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd15 = new Domain.Entities.File { OriName = "product-15.jpg", SaveName = saveProd15, TargetId = windbreaker.Id.ToString(), FileSize = GetLocalFileSize("product-15.jpg"), Extension = Path.GetExtension("product-15.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd16 = new Domain.Entities.File { OriName = "product-16.jpg", SaveName = saveProd16, TargetId = cap.Id.ToString(), FileSize = GetLocalFileSize("product-16.jpg"), Extension = Path.GetExtension("product-16.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd17 = new Domain.Entities.File { OriName = "product-17.jpg", SaveName = saveProd17, TargetId = jeans.Id.ToString(), FileSize = GetLocalFileSize("product-17.jpg"), Extension = Path.GetExtension("product-17.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd18 = new Domain.Entities.File { OriName = "product-18.jpg", SaveName = saveProd18, TargetId = tshirtStriped.Id.ToString(), FileSize = GetLocalFileSize("product-18.jpg"), Extension = Path.GetExtension("product-18.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd19 = new Domain.Entities.File { OriName = "product-19.jpg", SaveName = saveProd19, TargetId = tshirtSolid.Id.ToString(), FileSize = GetLocalFileSize("product-19.jpg"), Extension = Path.GetExtension("product-19.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd20 = new Domain.Entities.File { OriName = "product-20.jpg", SaveName = saveProd20, TargetId = pantsCargo.Id.ToString(), FileSize = GetLocalFileSize("product-20.jpg"), Extension = Path.GetExtension("product-20.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd21 = new Domain.Entities.File { OriName = "product-21.jpg", SaveName = saveProd21, TargetId = backpack.Id.ToString(), FileSize = GetLocalFileSize("product-21.jpg"), Extension = Path.GetExtension("product-21.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd22 = new Domain.Entities.File { OriName = "product-22.jpg", SaveName = saveProd22, TargetId = duffelBag.Id.ToString(), FileSize = GetLocalFileSize("product-22.jpg"), Extension = Path.GetExtension("product-22.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd23 = new Domain.Entities.File { OriName = "product-23.jpg", SaveName = saveProd23, TargetId = beanie.Id.ToString(), FileSize = GetLocalFileSize("product-23.jpg"), Extension = Path.GetExtension("product-23.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };
        var fileProd24 = new Domain.Entities.File { OriName = "product-24.jpg", SaveName = saveProd24, TargetId = belt.Id.ToString(), FileSize = GetLocalFileSize("product-24.jpg"), Extension = Path.GetExtension("product-24.jpg"), FilPurId = purProduct.Id, FilTypId = typeImg.Id, Status = "1", Creator = "System" };

        context.Files.AddRange(
            fileProd1, fileProd2, fileProd3, fileProd4, fileProd5, fileProd6,
            fileProd7, fileProd8, fileProd9, fileProd10, fileProd11, fileProd12,
            fileProd13, fileProd14, fileProd15, fileProd16, fileProd17, fileProd18,
            fileProd19, fileProd20, fileProd21, fileProd22, fileProd23, fileProd24
        );
        context.SaveChanges();

        // 7. 植入商品規格 (ProductSpecs)
        var coffeeSpec1 = new ProductSpec { ProductId = coffeeBean.Id, SpecName = "250g 裝", Price = 450.00m, Stock = 80 };
        var coffeeSpec2 = new ProductSpec { ProductId = coffeeBean.Id, SpecName = "500g 裝", Price = 850.00m, Stock = 40 };
        
        var mugSpec1 = new ProductSpec { ProductId = mug.Id, SpecName = "磨砂黑 (350ml)", Price = 350.00m, Stock = 50 };
        var mugSpec2 = new ProductSpec { ProductId = mug.Id, SpecName = "磨砂白 (350ml)", Price = 350.00m, Stock = 35 };

        var hoodieSpec1 = new ProductSpec { ProductId = hoodie.Id, SpecName = "M 號 / 黑色", Price = 1280.00m, Stock = 15 };
        var hoodieSpec2 = new ProductSpec { ProductId = hoodie.Id, SpecName = "L 號 / 黑色", Price = 1280.00m, Stock = 20 };
        var hoodieSpec3 = new ProductSpec { ProductId = hoodie.Id, SpecName = "XL 號 / 黑色", Price = 1280.00m, Stock = 10 };

        var toteSpec = new ProductSpec { ProductId = toteBag.Id, SpecName = "標準規格", Price = 590.00m, Stock = 110 };

        context.ProductSpecs.AddRange(coffeeSpec1, coffeeSpec2, mugSpec1, mugSpec2, hoodieSpec1, hoodieSpec2, hoodieSpec3, toteSpec);
        context.SaveChanges();

        // 8. 植入功能動作 (SystemActions)
        var actionProductCreate = new SystemAction { Code = "Product.Create", Name = "新增商品", Description = "可建立新商品", Status = "1" };
        var actionProductEdit = new SystemAction { Code = "Product.Edit", Name = "編輯商品", Description = "可修改商品資訊", Status = "1" };
        var actionProductDelete = new SystemAction { Code = "Product.Delete", Name = "刪除商品", Description = "可將商品從系統中刪除", Status = "1" };
        var actionEmployeeManage = new SystemAction { Code = "Employee.Manage", Name = "員工管理", Description = "可進行員工帳號與權限管理", Status = "1" };
        var actionProductDisableTest = new SystemAction { Code = "Product.DisableTest", Name = "測試停用功能", Description = "此功能已被禁用", Status = "0" };

        context.SystemActions.AddRange(actionProductCreate, actionProductEdit, actionProductDelete, actionEmployeeManage, actionProductDisableTest);
        context.SaveChanges();

        // 9. 植入角色功能關聯 (RoleActions)
        context.RoleActions.AddRange(
            new RoleAction { RoleId = 1, SystemActionId = actionProductCreate.Id, Status = "1" },
            new RoleAction { RoleId = 1, SystemActionId = actionProductEdit.Id, Status = "1" },
            new RoleAction { RoleId = 1, SystemActionId = actionProductDelete.Id, Status = "1" },
            new RoleAction { RoleId = 1, SystemActionId = actionEmployeeManage.Id, Status = "1" },
            new RoleAction { RoleId = 1, SystemActionId = actionProductDisableTest.Id, Status = "1" }
        );

        context.RoleActions.AddRange(
            new RoleAction { RoleId = 2, SystemActionId = actionProductCreate.Id, Status = "1" },
            new RoleAction { RoleId = 2, SystemActionId = actionProductEdit.Id, Status = "1" },
            new RoleAction { RoleId = 2, SystemActionId = actionProductDelete.Id, Status = "1" }
        );

        context.RoleActions.AddRange(
            new RoleAction { RoleId = 3, SystemActionId = actionProductEdit.Id, Status = "1" }
        );
        context.SaveChanges();

        // 10. 植入測試訂單 (Orders)
        var order1 = new Order
        {
            MerchantId = "store-a",
            UserId = userLimA.Id,
            OrderDate = DateTime.UtcNow.AddDays(-1),
            TotalAmount = 1730.00m,
            ReceivableAmount = 1630.00m,
            ReceivedAmount = 1630.00m,
            DiscountAmount = 100.00m,
            PointsAmount = 0.00m,
            PromoAmount = 0.00m,
            OrdStatus = "ToShip",
            PayStatus = "Paid",
            ReceiverName = "林志明",
            ShippingAddress = "台北市信義區信義路五段7號 (台北101)",
            UserPhone = "0912345678"
        };

        var order2 = new Order
        {
            MerchantId = "store-a",
            UserId = userChenA.Id,
            OrderDate = DateTime.UtcNow.AddHours(-5),
            TotalAmount = 1050.00m,
            ReceivableAmount = 1000.00m,
            ReceivedAmount = 0.00m,
            DiscountAmount = 0.00m,
            PointsAmount = 50.00m,
            PromoAmount = 0.00m,
            OrdStatus = "ToDispatch",
            PayStatus = "Unpaid",
            ReceiverName = "陳美玲",
            ShippingAddress = "台中市西屯區台灣大道三段99號",
            UserPhone = "0987654321"
        };

        var order3 = new Order
        {
            MerchantId = "store-b",
            UserId = userWangB.Id,
            OrderDate = DateTime.UtcNow.AddDays(-2),
            TotalAmount = 2180.00m,
            ReceivableAmount = 2180.00m,
            ReceivedAmount = 2180.00m,
            DiscountAmount = 0.00m,
            PointsAmount = 0.00m,
            PromoAmount = 0.00m,
            OrdStatus = "ToCollect",
            PayStatus = "Paid",
            ReceiverName = "王大同",
            ShippingAddress = "高雄市苓雅區自強三路5號 (高雄85大樓)",
            UserPhone = "0933111222"
        };

        var order4 = new Order
        {
            MerchantId = "store-b",
            UserId = userChangB.Id,
            OrderDate = DateTime.UtcNow.AddDays(-3),
            TotalAmount = 590.00m,
            ReceivableAmount = 590.00m,
            ReceivedAmount = 0.00m,
            DiscountAmount = 0.00m,
            PointsAmount = 0.00m,
            PromoAmount = 0.00m,
            OrdStatus = "Completed",
            PayStatus = "Unpaid",
            ReceiverName = "張小華",
            ShippingAddress = "新北市板橋區縣民大道二段7號",
            UserPhone = "0955888999"
        };

        var order5 = new Order
        {
            MerchantId = "store-a",
            UserId = userWangA.Id,
            OrderDate = DateTime.UtcNow.AddHours(-12),
            TotalAmount = 800.00m,
            ReceivableAmount = 800.00m,
            ReceivedAmount = 400.00m,
            DiscountAmount = 0.00m,
            PointsAmount = 0.00m,
            PromoAmount = 0.00m,
            OrdStatus = "ToPick",
            PayStatus = "PartiallyPaid",
            ReceiverName = "王大同",
            ShippingAddress = "台北市大安區信義路三段100號",
            UserPhone = "0933111222"
        };

        var order6 = new Order
        {
            MerchantId = "store-a",
            UserId = userLimA.Id,
            OrderDate = DateTime.UtcNow.AddHours(-24),
            TotalAmount = 350.00m,
            ReceivableAmount = 350.00m,
            ReceivedAmount = 350.00m,
            DiscountAmount = 0.00m,
            PointsAmount = 0.00m,
            PromoAmount = 0.00m,
            OrdStatus = "ToCollect",
            PayStatus = "Paid",
            ReceiverName = "林志明",
            ShippingAddress = "台北市中正區重慶南路一段122號",
            UserPhone = "0912345678"
        };

        var order7 = new Order
        {
            MerchantId = "store-a",
            UserId = userChangA.Id,
            OrderDate = DateTime.UtcNow.AddDays(-4),
            TotalAmount = 900.00m,
            ReceivableAmount = 800.00m,
            ReceivedAmount = 800.00m,
            DiscountAmount = 100.00m,
            PointsAmount = 0.00m,
            PromoAmount = 0.00m,
            OrdStatus = "Completed",
            PayStatus = "Paid",
            ReceiverName = "張小華",
            ShippingAddress = "台北市信義區忠孝東路五段2號",
            UserPhone = "0955888999"
        };

        var order8 = new Order
        {
            MerchantId = "store-b",
            UserId = userChenB.Id,
            OrderDate = DateTime.UtcNow.AddHours(-2),
            TotalAmount = 1280.00m,
            ReceivableAmount = 1280.00m,
            ReceivedAmount = 0.00m,
            DiscountAmount = 0.00m,
            PointsAmount = 0.00m,
            PromoAmount = 0.00m,
            OrdStatus = "ToDispatch",
            PayStatus = "Unpaid",
            ReceiverName = "陳美玲",
            ShippingAddress = "台中市南屯區公益路二段51號",
            UserPhone = "0987654321"
        };

        var order9 = new Order
        {
            MerchantId = "store-b",
            UserId = userLimB.Id,
            OrderDate = DateTime.UtcNow.AddHours(-18),
            TotalAmount = 2560.00m,
            ReceivableAmount = 2560.00m,
            ReceivedAmount = 1280.00m,
            DiscountAmount = 0.00m,
            PointsAmount = 0.00m,
            PromoAmount = 0.00m,
            OrdStatus = "ToPick",
            PayStatus = "PartiallyPaid",
            ReceiverName = "林志明",
            ShippingAddress = "台北市松山區南京東路四段2號",
            UserPhone = "0912345678"
        };

        var order10 = new Order
        {
            MerchantId = "store-b",
            UserId = userWangB.Id,
            OrderDate = DateTime.UtcNow.AddDays(-1),
            TotalAmount = 590.00m,
            ReceivableAmount = 590.00m,
            ReceivedAmount = 590.00m,
            DiscountAmount = 0.00m,
            PointsAmount = 0.00m,
            PromoAmount = 0.00m,
            OrdStatus = "ToShip",
            PayStatus = "Paid",
            ReceiverName = "王大同",
            ShippingAddress = "高雄市三民區建國二路318號",
            UserPhone = "0933111222"
        };


        context.Orders.AddRange(order1, order2, order3, order4, order5, order6, order7, order8, order9, order10);
        context.SaveChanges();

        // 11. 植入訂單明細 (OrderItems)
        context.OrderItems.AddRange(
            // Order 1
            new OrderItem
            {
                OrderId = order1.Id,
                ProductId = coffeeBean.Id,
                ProductSpecId = coffeeSpec1.Id,
                SpecName = "中淺烘焙 / 半磅",
                Quantity = 2,
                OriginalUnitPrice = 450.00m,
                TotalAmount = 900.00m
            },
            new OrderItem
            {
                OrderId = order1.Id,
                ProductId = coffeeBean.Id,
                ProductSpecId = coffeeSpec2.Id,
                SpecName = "500ml / 高硼矽耐熱",
                Quantity = 1,
                OriginalUnitPrice = 480.00m,
                TotalAmount = 480.00m
            },
            new OrderItem
            {
                OrderId = order1.Id,
                ProductId = mug.Id,
                ProductSpecId = mugSpec1.Id,
                SpecName = "磨砂黑 / 350ml",
                Quantity = 1,
                OriginalUnitPrice = 350.00m,
                TotalAmount = 350.00m
            },
            // Order 2
            new OrderItem
            {
                OrderId = order2.Id,
                ProductId = mug.Id,
                ProductSpecId = mugSpec1.Id,
                SpecName = "磨砂黑 / 350ml",
                Quantity = 3,
                OriginalUnitPrice = 350.00m,
                TotalAmount = 1050.00m
            },
            // Order 3
            new OrderItem
            {
                OrderId = order3.Id,
                ProductId = hoodie.Id,
                ProductSpecId = hoodieSpec1.Id,
                SpecName = "極致黑 / XL",
                Quantity = 1,
                OriginalUnitPrice = 1280.00m,
                TotalAmount = 1280.00m
            },
            new OrderItem
            {
                OrderId = order3.Id,
                ProductId = hoodie.Id,
                ProductSpecId = hoodieSpec2.Id,
                SpecName = "復古藍 / 可調節",
                Quantity = 2,
                OriginalUnitPrice = 450.00m,
                TotalAmount = 900.00m
            },
            // Order 4
            new OrderItem
            {
                OrderId = order4.Id,
                ProductId = toteBag.Id,
                ProductSpecId = toteSpec.Id,
                SpecName = "原色米白 / 單一規格",
                Quantity = 1,
                OriginalUnitPrice = 590.00m,
                TotalAmount = 590.00m
            },
            // Order 5
            new OrderItem
            {
                OrderId = order5.Id,
                ProductId = coffeeBean.Id,
                ProductSpecId = coffeeSpec1.Id,
                SpecName = "中淺烘焙 / 半磅",
                Quantity = 1,
                OriginalUnitPrice = 450.00m,
                TotalAmount = 450.00m
            },
            new OrderItem
            {
                OrderId = order5.Id,
                ProductId = mug.Id,
                ProductSpecId = mugSpec1.Id,
                SpecName = "磨砂黑 / 350ml",
                Quantity = 1,
                OriginalUnitPrice = 350.00m,
                TotalAmount = 350.00m
            },
            // Order 6
            new OrderItem
            {
                OrderId = order6.Id,
                ProductId = mug.Id,
                ProductSpecId = mugSpec1.Id,
                SpecName = "磨砂黑 / 350ml",
                Quantity = 1,
                OriginalUnitPrice = 350.00m,
                TotalAmount = 350.00m
            },
            // Order 7
            new OrderItem
            {
                OrderId = order7.Id,
                ProductId = coffeeBean.Id,
                ProductSpecId = coffeeSpec1.Id,
                SpecName = "中淺烘焙 / 半磅",
                Quantity = 2,
                OriginalUnitPrice = 450.00m,
                TotalAmount = 900.00m
            },
            // Order 8
            new OrderItem
            {
                OrderId = order8.Id,
                ProductId = hoodie.Id,
                ProductSpecId = hoodieSpec1.Id,
                SpecName = "極致黑 / XL",
                Quantity = 1,
                OriginalUnitPrice = 1280.00m,
                TotalAmount = 1280.00m
            },
            // Order 9
            new OrderItem
            {
                OrderId = order9.Id,
                ProductId = hoodie.Id,
                ProductSpecId = hoodieSpec1.Id,
                SpecName = "極致黑 / XL",
                Quantity = 2,
                OriginalUnitPrice = 1280.00m,
                TotalAmount = 2560.00m
            },
            // Order 10
            new OrderItem
            {
                OrderId = order10.Id,
                ProductId = toteBag.Id,
                ProductSpecId = toteSpec.Id,
                SpecName = "原色米白 / 單一規格",
                Quantity = 1,
                OriginalUnitPrice = 590.00m,
                TotalAmount = 590.00m
            }
        );
        context.SaveChanges();

    }

    /// <summary>
    /// 簡單 SHA256 密碼雜湊 Helper
    /// </summary>
    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    /// <summary>
    /// 將原始圖片複製並重命名為 NanoID 分級子目錄路徑 (繁體中文註解)
    /// </summary>
    private static string CopyToNanoIdPath(string originalName, string nanoId)
    {
        var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        var sourcePath = Path.Combine(uploadsRoot, originalName);
        if (!System.IO.File.Exists(sourcePath))
        {
            // 防呆處理：如果來源原始檔案不存在，直接回傳原始檔名，避免程式崩潰
            return originalName; 
        }

        // 提取 NanoID 前兩字元作為第一層子目錄，第三四字元作為第二層子目錄
        var subDir1 = nanoId.Substring(0, 2);
        var subDir2 = nanoId.Substring(2, 2);
        var destDir = Path.Combine(uploadsRoot, subDir1, subDir2);
        
        // 確保分級目錄已存在
        Directory.CreateDirectory(destDir);

        // 動態取得原始檔案的副檔名 (繁體中文註解)
        var extension = Path.GetExtension(originalName);

        // 拼接成相對儲存檔名與絕對目標路徑
        var saveName = $"{subDir1}/{subDir2}/{nanoId}{extension}";
        var destPath = Path.Combine(destDir, $"{nanoId}{extension}");

        System.IO.File.Copy(sourcePath, destPath, true);
        return saveName;
    }

    /// <summary>
    /// 讀取本地檔案的實體檔案大小 (繁體中文註解)
    /// </summary>
    private static long GetLocalFileSize(string originalName)
    {
        var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        var sourcePath = Path.Combine(uploadsRoot, originalName);
        if (System.IO.File.Exists(sourcePath))
        {
            return new FileInfo(sourcePath).Length;
        }
        return 0;
    }
}

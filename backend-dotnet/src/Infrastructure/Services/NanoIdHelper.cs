using System;
using System.Security.Cryptography;

namespace Infrastructure.Services;

/// <summary>
/// NanoID 檔名隨機產生輔助工具 (繁體中文註解)
/// </summary>
public static class NanoIdHelper
{
    // 標準 NanoID 使用的字元集 (共 64 個字元)
    private const string Alphabet = "_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    /// <summary>
    /// 產生一個指定長度的唯一隨機金鑰 (預設長度為 21 字元，安全且短小)
    /// </summary>
    /// <param name="size">金鑰字元長度</param>
    /// <returns>安全隨機唯一字串</returns>
    public static string Generate(int size = 21)
    {
        if (size <= 0) throw new ArgumentException("長度必須大於零。", nameof(size));

        var bytes = new byte[size];
        
        // 使用密碼學安全的隨機數填充位元組陣列，以防並發衝突與可預測性
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(bytes);
        }

        var chars = new char[size];
        for (int i = 0; i < size; i++)
        {
            // 將隨機位元組轉化為字元集中的對應字元
            chars[i] = Alphabet[bytes[i] % Alphabet.Length];
        }

        return new string(chars);
    }
}

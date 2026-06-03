# 批量下載商品圖腳本 (繁體中文註解)
$images = @{
    "product-1.jpg" = "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500"
    "product-2.jpg" = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500"
    "product-3.jpg" = "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500"
    "product-4.jpg" = "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=500"
    "product-5.jpg" = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500"
    "product-6.jpg" = "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500"
    "product-7.jpg" = "https://images.unsplash.com/photo-1580933187699-7fbc796e6cee?w=500"
    "product-8.jpg" = "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=500"
    "product-9.jpg" = "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=500"
    "product-10.jpg" = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500"
    "product-11.jpg" = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500"
    "product-12.jpg" = "https://images.unsplash.com/photo-1461023246083-d830f39b1a50?w=500"
    "product-13.jpg" = "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500"
    "product-14.jpg" = "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500"
    "product-15.jpg" = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500"
    "product-16.jpg" = "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500"
    "product-17.jpg" = "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500"
    "product-18.jpg" = "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=500"
    "product-19.jpg" = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"
    "product-20.jpg" = "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500"
    "product-21.jpg" = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"
    "product-22.jpg" = "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=500"
    "product-23.jpg" = "https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?w=500"
    "product-24.jpg" = "https://images.unsplash.com/photo-1624222247344-550fb8ec2704?w=500"
}

foreach ($item in $images.GetEnumerator()) {
    $filename = $item.Key
    $url = $item.Value
    Write-Host "Downloading $filename..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $filename -TimeoutSec 15 -ErrorAction Stop
    } catch {
        Write-Warning "Failed to download $filename from $url. Error: $_"
    }
}
Write-Host "Download process finished."

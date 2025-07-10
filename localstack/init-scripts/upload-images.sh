#!/bin/bash

echo "Setting up S3 bucket and uploading images..."

# Create a bucket and upload images to it
awslocal s3 mb s3://il.co.yuvalrayer


# Step 1: Download image from URL
echo "Downloading image from URL..."
curl -s -L "https://picsum.photos/500/700" -o /init-resources/picsum.photos500700.jpg
curl -s -L "https://picsum.photos/400/600" -o /init-resources/picsum.photos400600.jpg
curl -s -L "https://picsum.photos/300/300" -o /init-resources/picsum.photos300300.jpg
curl -s -L "https://picsum.photos/200/300" -o /init-resources/picsum.photos200300.jpg
curl -s -L "https://picsum.photos/600/400" -o /init-resources/picsum.photos600400.jpg
echo "Finished download from URL!"

# Step 2: Upload all images from /init-resources
for file in /init-resources/*; do
  echo "Uploading $file"
  awslocal s3 cp "$file" s3://il.co.yuvalrayer/
done

echo "Upload complete!"

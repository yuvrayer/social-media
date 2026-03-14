#!/bin/bash

echo "Setting up S3 bucket and uploading images..."

# Create a bucket and upload images to it
awslocal s3 mb s3://il.co.yuvalrayer
awslocal s3api put-bucket-cors --bucket il.co.yuvalrayer --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}'

# Step 1: Download image from URL
mkdir -p /init-resources/il.co.yuvalrayer

echo "Downloading image from URL..."
curl -s -L "https://picsum.photos/500/700" -o /init-resources/il.co.yuvalrayer/picsum.photos500700.jpg
curl -s -L "https://picsum.photos/400/600" -o /init-resources/il.co.yuvalrayer/picsum.photos400600.jpg
curl -s -L "https://picsum.photos/300/300" -o /init-resources/il.co.yuvalrayer/picsum.photos300300.jpg
curl -s -L "https://picsum.photos/200/300" -o /init-resources/il.co.yuvalrayer/picsum.photos200300.jpg
curl -s -L "https://picsum.photos/600/400" -o /init-resources/il.co.yuvalrayer/picsum.photos600400.jpg
echo "Finished download from URL!"

# Step 2: Upload all images from /init-resources
for file in /init-resources/il.co.yuvalrayer/*; do
  echo "Uploading $file"
  awslocal s3 cp "$file" s3://il.co.yuvalrayer/ --acl public-read
done

for file in /init-resources/*; do
  echo "Uploading $file"
  awslocal s3 cp "$file" s3://il.co.yuvalrayer/ --acl public-read
done

# Upload image2 to bob user bucket (to present pre loaded story)
echo "Uploading image2 to bucket 1230ae30-dc4f-4752-bd84-092956f5c633..."
awslocal s3 mb s3://1230ae30-dc4f-4752-bd84-092956f5c633
awslocal s3api put-bucket-cors --bucket 1230ae30-dc4f-4752-bd84-092956f5c633 --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}'

awslocal s3 cp /init-resources/image2.jpg s3://1230ae30-dc4f-4752-bd84-092956f5c633/
echo "Upload of image2 complete!"

echo "Upload complete!"

touch /tmp/localstack-init-done

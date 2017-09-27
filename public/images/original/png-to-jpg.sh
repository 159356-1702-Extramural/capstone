#!/bin/bash
#convert

for image in card_*_tiny.jpg; do
convert -quality 90 "$image" "../${image%.png}.jpg"
echo “image $image converted to ${image%.png}.jpg”
done

for image in card_*_small.jpg; do
convert -quality 80 "$image" "../${image%.png}.jpg"
echo “image $image converted to ${image%.png}.jpg”
done

for image in dev_*.jpg; do
convert -quality 80 "$image" "../${image%.png}.jpg"
echo “image $image converted to ${image%.png}.jpg”
done
# reconvert just the large cards with crop
for image in dev_*large.jpg; do
convert -quality 70 -trim "$image" "../${image%.png}.jpg"
echo “image $image converted to ${image%.png}.jpg”
done

exit 0k

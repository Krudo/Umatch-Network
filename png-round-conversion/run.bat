@echo off
convert -size 200x200 xc:none -draw "circle 99.5,99.5 28,28" circle.png
convert circle.png -alpha extract mask.png

for %%r in (*.jpg) do convert %%r mask.png -alpha Off -compose CopyOpacity -composite output\%%r.png
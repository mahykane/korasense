#!/usr/bin/env python3
from PIL import Image, ImageDraw
import sys

def create_icon(size, output_path):
    # Create a simple folder icon
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw a simple folder shape
    folder_color = (100, 150, 250)
    padding = size // 8
    draw.rectangle([padding, padding*2, size-padding, size-padding], fill=folder_color)
    draw.rectangle([padding, padding, padding*3, padding*2], fill=folder_color)
    
    img.save(output_path, 'PNG')
    print(f"Created {output_path}")

# Create all required icons
create_icon(32, 'icons/32x32.png')
create_icon(128, 'icons/128x128.png')
create_icon(256, 'icons/128x128@2x.png')
create_icon(512, 'icons/icon.png')

# For .icns and .ico, just copy the 512px version
import shutil
shutil.copy('icons/icon.png', 'icons/icon.icns')
shutil.copy('icons/icon.png', 'icons/icon.ico')
print("Icons created successfully!")

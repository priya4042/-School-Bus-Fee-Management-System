#!/usr/bin/env python3
"""
Generate WayPro Pro App Icon
Creates: 512×512 px PNG icon for Google Play Store
"""

from PIL import Image, ImageDraw, ImageFont

# Create image with rounded background
SIZE = 512
image = Image.new('RGB', (SIZE, SIZE), color=(30, 64, 175))  # #1e40af - WayPro blue
draw = ImageDraw.Draw(image)

# Create gradient background
for y in range(SIZE):
    ratio = y / SIZE
    r = int(30 + (15 - 30) * ratio)
    g = int(64 + (40 - 64) * ratio)
    b = int(175 + (138 - 175) * ratio)
    draw.line([(0, y), (SIZE, y)], fill=(r, g, b))

# Draw rounded corners (create mask for rounded corners)
corners = Image.new('L', (SIZE, SIZE), 0)
corners_draw = ImageDraw.Draw(corners)
corners_draw.ellipse([0, 0, SIZE-1, SIZE-1], fill=255)
image.putalpha(corners)

# ============ SCHOOL BUS ICON (CENTER) ============

bus_x, bus_y = 100, 180
bus_width, bus_height = 312, 160

# Bus body - main background
draw.rectangle([bus_x, bus_y, bus_x + bus_width, bus_y + bus_height], 
               fill=(251, 191, 36), outline=(15, 23, 42), width=3)

# Bus roof
roof_points = [
    (bus_x, bus_y),
    (bus_x + 60, bus_y - 80),
    (bus_x + bus_width - 60, bus_y - 80),
    (bus_x + bus_width, bus_y)
]
draw.polygon(roof_points, fill=(251, 191, 36), outline=(15, 23, 42))

# Front windshield
draw.ellipse([bus_x + 20, bus_y - 60, bus_x + 100, bus_y - 10], 
             fill=(174, 229, 255), outline=(14, 165, 233), width=2)

# Side windows (5 windows)
for i in range(5):
    x = bus_x + 120 + (i * 45)
    draw.rounded_rectangle([x, bus_y - 50, x + 32, bus_y - 20], 
                          radius=3, fill=(174, 229, 255), outline=(14, 165, 233), width=1)

# Lower windows (4)
for i in range(4):
    x = bus_x + 40 + (i * 75)
    draw.rounded_rectangle([x, bus_y + 80, x + 55, bus_y + 140], 
                          radius=3, fill=(174, 229, 255), outline=(14, 165, 233), width=1)

# Wheels
wheel_y = bus_y + bus_height + 20
# Front wheel
draw.ellipse([bus_x + 40 - 40, wheel_y - 40, bus_x + 40 + 40, wheel_y + 40], 
             fill=(15, 23, 42), outline=(75, 85, 99), width=2)
draw.ellipse([bus_x + 40 - 28, wheel_y - 28, bus_x + 40 + 28, wheel_y + 28], 
             fill=(75, 85, 99))
draw.ellipse([bus_x + 40 - 16, wheel_y - 16, bus_x + 40 + 16, wheel_y + 16], 
             fill=(55, 65, 81))

# Rear wheel
draw.ellipse([bus_x + bus_width - 40 - 40, wheel_y - 40, bus_x + bus_width - 40 + 40, wheel_y + 40], 
             fill=(15, 23, 42), outline=(75, 85, 99), width=2)
draw.ellipse([bus_x + bus_width - 40 - 28, wheel_y - 28, bus_x + bus_width - 40 + 28, wheel_y + 28], 
             fill=(75, 85, 99))
draw.ellipse([bus_x + bus_width - 40 - 16, wheel_y - 16, bus_x + bus_width - 40 + 16, wheel_y + 16], 
             fill=(55, 65, 81))

# Headlights
draw.ellipse([bus_x + 15, bus_y + 50, bus_x + 35, bus_y + 70], fill=(255, 255, 255))
draw.ellipse([bus_x + 50, bus_y + 50, bus_x + 70, bus_y + 70], fill=(255, 255, 255))

# ============ LOCATION PIN OVERLAY (TOP RIGHT) ============

pin_x, pin_y = 420, 100
# Pin circle
draw.ellipse([pin_x - 30, pin_y - 30, pin_x + 30, pin_y + 30], 
             fill=(30, 64, 175), outline=(251, 191, 36), width=3)
# Pin point
pin_point = [(pin_x - 15, pin_y + 35), (pin_x, pin_y + 50), (pin_x + 15, pin_y + 35)]
draw.polygon(pin_point, fill=(30, 64, 175), outline=(251, 191, 36))
# Center dot
draw.ellipse([pin_x - 10, pin_y - 10, pin_x + 10, pin_y + 10], fill=(251, 191, 36))

# ============ TEXT AT BOTTOM ============

try:
    font = ImageFont.truetype("arial.ttf", 48)
    small_font = ImageFont.truetype("arial.ttf", 28)
except:
    font = ImageFont.load_default()
    small_font = ImageFont.load_default()

# "WayPro" text
draw.text((SIZE // 2, 420), "WayPro", font=font, fill=(255, 255, 255), anchor="mm")

# "Pro" highlight
draw.text((SIZE // 2 + 100, 415), "Pro", font=small_font, fill=(251, 191, 36), anchor="mm")

# Save image
output_path = "wayprro-app-icon-512x512.png"
image.save(output_path, 'PNG', optimize=True)

import os
file_size = os.path.getsize(output_path)
print(f"✅ App Icon Generated Successfully!")
print(f"📁 File: {output_path}")
print(f"📏 Dimensions: 512×512 px (EXACT)")
print(f"📦 Format: PNG")
print(f"💾 File Size: {file_size / 1024:.1f} KB")
print(f"\n✓ Ready to upload to Google Play Console")

#!/usr/bin/env python3
"""
Generate WayPro Pro Feature Graphic - CLEAN VERSION
Creates: 1024×500 px PNG (optimized for Google Play Store)
"""

from PIL import Image, ImageDraw, ImageFont
import os

# EXACT dimensions required by Play Store
WIDTH = 1024
HEIGHT = 500

# Create new image with solid dark blue background
image = Image.new('RGB', (WIDTH, HEIGHT), color=(15, 23, 42))  # #0f172a
draw = ImageDraw.Draw(image)

# Add subtle gradient background
for y in range(HEIGHT):
    ratio = y / HEIGHT
    r = int(15 + (30 - 15) * ratio)
    g = int(23 + (58 - 23) * ratio)
    b = int(42 + (138 - 42) * ratio)
    draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

# Add decorative circles
draw.ellipse([850, -80, 1150, 220], outline=(251, 191, 36), width=0, fill=(251, 191, 36, 25))
draw.ellipse([920, 320, 1200, 600], outline=(30, 58, 138), width=0, fill=(30, 58, 138, 30))

# ==================== SCHOOL BUS ====================
# Bus body - main rectangle
draw.rectangle([50, 200, 350, 340], fill=(30, 64, 175), outline=(15, 23, 42), width=2)

# Bus roof - triangular top
roof_polygon = [(50, 200), (85, 130), (315, 110), (350, 200)]
draw.polygon(roof_polygon, fill=(30, 58, 138), outline=(15, 23, 42))

# Yellow stripe on roof
draw.line([(50, 200), (350, 200)], fill=(251, 191, 36), width=12)

# Windows - Front windshield
draw.rectangle([65, 140, 115, 195], fill=(165, 216, 255), outline=(14, 165, 233), width=1)

# Side windows row 1 (upper)
for i in range(4):
    x = 140 + (i * 45)
    draw.rectangle([x, 155, x + 30, 180], fill=(165, 216, 255), outline=(14, 165, 233), width=1)

# Side windows row 2 (lower - passenger)
for i in range(4):
    x = 70 + (i * 65)
    draw.rectangle([x, 220, x + 50, 300], fill=(165, 216, 255), outline=(14, 165, 233), width=1)

# Wheels - front
draw.ellipse([70, 330, 130, 390], fill=(31, 41, 55), outline=(75, 85, 99), width=2)
draw.ellipse([80, 340, 120, 380], fill=(75, 85, 99))
draw.ellipse([87, 347, 113, 373], fill=(55, 65, 81))

# Wheels - rear
draw.ellipse([270, 330, 330, 390], fill=(31, 41, 55), outline=(75, 85, 99), width=2)
draw.ellipse([280, 340, 320, 380], fill=(75, 85, 99))
draw.ellipse([287, 347, 313, 373], fill=(55, 65, 81))

# Headlights
draw.ellipse([55, 225, 70, 240], fill=(251, 191, 36))
draw.ellipse([72, 225, 87, 240], fill=(251, 191, 36))

# Bumper
draw.rectangle([50, 330, 350, 345], fill=(251, 191, 36))

# ==================== TEXT ====================

# Load fonts
try:
    big_font = ImageFont.truetype("arial.ttf", 95)
    title_font = ImageFont.truetype("arial.ttf", 50)
    subtitle_font = ImageFont.truetype("arial.ttf", 28)
    feature_font = ImageFont.truetype("arial.ttf", 22)
except:
    big_font = ImageFont.load_default()
    title_font = ImageFont.load_default()
    subtitle_font = ImageFont.load_default()
    feature_font = ImageFont.load_default()

# Main title
draw.text((420, 35), "WayP", fill=(255, 255, 255), font=big_font)
draw.text((710, 35), "Pro", fill=(251, 191, 36), font=big_font)

# Tagline
draw.text((420, 155), "School Bus Fee Manager", fill=(255, 255, 255), font=title_font)

# Subtitle
draw.text((420, 220), "Safe • Secure • Real-time Tracking", fill=(203, 213, 225), font=subtitle_font)

# Feature list
feature_y_start = 300

# Location icon + text
draw.ellipse([440, feature_y_start - 12, 460, feature_y_start + 8], fill=(251, 191, 36))
draw.ellipse([448, feature_y_start - 5, 452, feature_y_start + 5], fill=(30, 64, 175))
draw.text((475, feature_y_start - 10), "Live Bus Tracking", fill=(224, 242, 254), font=feature_font)

# Payment icon + text
feature_y = feature_y_start + 45
draw.rectangle([440, feature_y - 10, 460, feature_y + 10], outline=(251, 191, 36), width=2)
draw.line([(440, feature_y), (460, feature_y)], fill=(251, 191, 36), width=2)
draw.rectangle([443, feature_y + 5, 451, feature_y + 9], fill=(251, 191, 36))
draw.text((475, feature_y - 10), "Easy Payments", fill=(224, 242, 254), font=feature_font)

# Security icon + text
feature_y = feature_y_start + 90
draw.polygon([(450, feature_y - 20), (438, feature_y - 10), (438, feature_y + 10), (450, feature_y + 16), (462, feature_y + 10), (462, feature_y - 10)], 
             outline=(251, 191, 36), width=2)
draw.line([(445, feature_y), (450, feature_y + 5), (458, feature_y - 3)], fill=(251, 191, 36), width=2)
draw.text((475, feature_y - 10), "Secure & Private", fill=(224, 242, 254), font=feature_font)

# Save with high quality
output_path = "wayprro-feature-graphic-1024x500.png"
image.save(output_path, 'PNG', optimize=True, quality=95)

# Get file info
import os
file_size = os.path.getsize(output_path)
print(f"✅ Feature Graphic Generated Successfully!")
print(f"📁 File: {output_path}")
print(f"📏 Dimensions: {WIDTH}×{HEIGHT} px (EXACT)")
print(f"📦 Format: PNG (High Quality)")
print(f"💾 File Size: {file_size / 1024:.1f} KB")
print(f"\n✓ Ready to upload to Google Play Console")
print(f"\nUpload Instructions:")
print(f"1. Open: https://play.google.com/console")
print(f"2. Select your app 'WayPro Pro'")
print(f"3. Go to: Store listing → Graphics")
print(f"4. Click 'Feature graphic' upload area")
print(f"5. Select: {output_path}")
print(f"6. Click Save")

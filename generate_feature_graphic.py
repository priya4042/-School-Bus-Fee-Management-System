#!/usr/bin/env python3
"""
Generate WayPro Pro Feature Graphic for Google Play Store
Creates: 1024×500 px PNG (exact dimensions required by Play Store)
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Image dimensions (EXACT for Play Store)
WIDTH = 1024
HEIGHT = 500

# Create image with gradient background
image = Image.new('RGB', (WIDTH, HEIGHT), color='#0f172a')
draw = ImageDraw.Draw(image, 'RGBA')

# Create gradient background (dark blue to darker blue)
for y in range(HEIGHT):
    # Gradient from #0f172a to #1e3a8a
    r = int(15 + (30 - 15) * (y / HEIGHT))
    g = int(23 + (58 - 23) * (y / HEIGHT))
    b = int(42 + (138 - 42) * (y / HEIGHT))
    draw.line([(0, y), (WIDTH, y)], fill=(r, g, b, 255))

# Add accent circles (decorative)
draw.ellipse([850, -50, 1100, 200], fill=(251, 191, 36, 20))
draw.ellipse([900, 300, 1200, 600], fill=(30, 58, 138, 25))

# ============ DRAW BUS (LEFT SIDE) ============

bus_x, bus_y = 50, 200
bus_width, bus_height = 300, 140

# Bus body
draw.rounded_rectangle([bus_x, bus_y, bus_x + bus_width, bus_y + bus_height], 
                       radius=12, fill=(30, 64, 175, 255), outline=(15, 23, 42, 255), width=2)

# Bus roof
roof_points = [(bus_x, bus_y), (bus_x + 30, bus_y - 60), (bus_x + 270, bus_y - 80), 
               (bus_x + bus_width, bus_y - 55), (bus_x + bus_width, bus_y)]
draw.polygon(roof_points, fill=(30, 58, 138, 255), outline=(15, 23, 42, 255))

# Roof accent (yellow stripe)
draw.rectangle([bus_x, bus_y - 8, bus_x + bus_width, bus_y + 0], fill=(251, 191, 36, 255))

# Front windshield
draw.rounded_rectangle([bus_x + 15, bus_y - 50, bus_x + 80, bus_y - 5], 
                       radius=4, fill=(165, 216, 255, 230), outline=(14, 165, 233, 255), width=1)

# Side windows (4 windows - upper)
window_positions = [
    (140, 155, 175, 190),
    (185, 155, 220, 190),
    (230, 155, 265, 190),
    (275, 155, 310, 190),
]
for x1, y1, x2, y2 in window_positions:
    draw.rounded_rectangle([bus_x + x1 - 140, bus_y + y1 - 200, bus_x + x2 - 140, bus_y + y2 - 200], 
                          radius=3, fill=(165, 216, 255, 220), outline=(14, 165, 233, 255), width=1)

# Lower windows (passenger windows)
lower_windows = [
    (20, 20, 70, 76),
    (85, 20, 135, 76),
    (150, 20, 200, 76),
    (215, 20, 265, 76),
]
for x1, y1, x2, y2 in lower_windows:
    draw.rounded_rectangle([bus_x + x1, bus_y + y1, bus_x + x2, bus_y + y2], 
                          radius=3, fill=(165, 216, 255, 220), outline=(14, 165, 233, 255), width=1)

# Yellow bumper stripe
draw.rectangle([bus_x, bus_y + bus_height, bus_x + bus_width, bus_y + bus_height + 15], 
               fill=(251, 191, 36, 255), outline=(31, 41, 55, 255))

# Wheels (front)
wheel_y = bus_y + bus_height + 30
draw.ellipse([bus_x + 50 - 32, wheel_y - 32, bus_x + 50 + 32, wheel_y + 32], 
             fill=(15, 23, 42, 255), outline=(55, 65, 81, 255), width=2)
draw.ellipse([bus_x + 50 - 24, wheel_y - 24, bus_x + 50 + 24, wheel_y + 24], 
             fill=(55, 65, 81, 255))
draw.ellipse([bus_x + 50 - 18, wheel_y - 18, bus_x + 50 + 18, wheel_y + 18], 
             fill=(75, 85, 99, 255))

# Wheels (rear)
draw.ellipse([bus_x + 300 - 32, wheel_y - 32, bus_x + 300 + 32, wheel_y + 32], 
             fill=(15, 23, 42, 255), outline=(55, 65, 81, 255), width=2)
draw.ellipse([bus_x + 300 - 24, wheel_y - 24, bus_x + 300 + 24, wheel_y + 24], 
             fill=(55, 65, 81, 255))
draw.ellipse([bus_x + 300 - 18, wheel_y - 18, bus_x + 300 + 18, wheel_y + 18], 
             fill=(75, 85, 99, 255))

# Headlights
draw.ellipse([bus_x + 10, bus_y + 35, bus_x + 26, bus_y + 51], fill=(251, 191, 36, 205))
draw.ellipse([bus_x + 25, bus_y + 35, bus_x + 41, bus_y + 51], fill=(251, 191, 36, 205))

# ============ TEXT (RIGHT SIDE) ============

# Try to load system fonts, fallback to default
try:
    title_font = ImageFont.truetype("arial.ttf", 80)
    tagline_font = ImageFont.truetype("arial.ttf", 38)
    subtitle_font = ImageFont.truetype("arial.ttf", 24)
    feature_font = ImageFont.truetype("arial.ttf", 20)
except:
    # Fallback fonts
    title_font = ImageFont.load_default()
    tagline_font = ImageFont.load_default()
    subtitle_font = ImageFont.load_default()
    feature_font = ImageFont.load_default()

# App title "WayP" (white)
draw.text((420, 45), "WayP", font=title_font, fill=(255, 255, 255, 255))

# "Pro" (yellow)
draw.text((690, 45), "Pro", font=title_font, fill=(251, 191, 36, 255))

# Tagline
draw.text((420, 150), "School Bus Fee Manager", font=tagline_font, fill=(255, 255, 255, 255))

# Subtitle
draw.text((420, 210), "Safe • Secure • Real-time Tracking", font=subtitle_font, fill=(203, 213, 225, 255))

# ============ FEATURE ICONS & TEXT ============

# GPS Icon
icon_y = 300
draw.ellipse([430, icon_y - 14, 458, icon_y + 14], fill=(251, 191, 36, 255))
draw.ellipse([438, icon_y - 5, 450, icon_y + 5], fill=(30, 64, 175, 255))
draw.text((465, icon_y - 10), "Live Bus Tracking", font=feature_font, fill=(224, 242, 254, 255))

# Payment Icon
icon_y = 345
draw.rectangle([430, icon_y - 10, 458, icon_y + 10], outline=(251, 191, 36, 255), width=2)
draw.line([(430, icon_y), (458, icon_y)], fill=(251, 191, 36, 255), width=2)
draw.rectangle([433, icon_y + 5, 441, icon_y + 9], fill=(251, 191, 36, 205))
draw.text((465, icon_y - 10), "Easy Payments", font=feature_font, fill=(224, 242, 254, 255))

# Security Icon
icon_y = 390
shield_points = [(444, icon_y - 25), (432, icon_y - 15), (432, icon_y + 5), (444, icon_y + 14), (456, icon_y + 5), (456, icon_y - 15)]
draw.polygon(shield_points, outline=(251, 191, 36, 255), width=2)
# Checkmark
draw.line([(440, icon_y), (444, icon_y + 4), (452, icon_y - 4)], fill=(251, 191, 36, 255), width=2)
draw.text((465, icon_y - 12), "Secure & Private", font=feature_font, fill=(224, 242, 254, 255))

# Save image
output_path = "wayprro-feature-graphic-1024x500.png"
image.save(output_path, 'PNG', quality=95)

print(f"✅ Feature graphic created successfully!")
print(f"📁 File: {output_path}")
print(f"📏 Dimensions: {WIDTH}×{HEIGHT} px (EXACT for Play Store)")
print(f"📦 Format: PNG")
print(f"\nTo upload to Google Play Console:")
print(f"1. Go to Play Console → Store Listing")
print(f"2. Click 'Graphics' section")
print(f"3. Upload this file to 'Feature graphic'")
print(f"4. Click Save")

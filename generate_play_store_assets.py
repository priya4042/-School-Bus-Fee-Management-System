#!/usr/bin/env python3
"""
BusWay Pro - Google Play Store Assets Generator
Generates all required images for Play Store submission
"""

from PIL import Image, ImageDraw, ImageFont
import os
from pathlib import Path

# Color scheme
BLUE = "#1e40af"          # Primary blue
YELLOW = "#fbbf24"        # School bus yellow
DARK_BLUE = "#1e3a8a"     # Dark blue
WHITE = "#ffffff"
DARK_GRAY = "#1f2937"
LIGHT_GRAY = "#f3f4f6"

# Ensure Pillow is available
try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("ERROR: Pillow not found. Install with: pip install Pillow")
    exit(1)

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_app_icon():
    """Create 512x512 app icon with school bus design"""
    print("Creating app icon (512x512)...")
    
    size = 512
    img = Image.new('RGBA', (size, size), hex_to_rgb(BLUE) + (255,))
    draw = ImageDraw.Draw(img)
    
    # Draw gradient effect with circle
    for i in range(size // 2, 0, -5):
        alpha = int(255 * (1 - i / (size // 2)))
        color = hex_to_rgb(DARK_BLUE) + (alpha,)
        draw.ellipse([size//2 - i, size//2 - i, size//2 + i, size//2 + i], fill=color)
    
    # Draw school bus shape (simplified)
    # Bus body
    bus_x = size // 4
    bus_y = size // 3
    bus_width = size // 2
    bus_height = size // 3
    
    # Draw bus rectangle
    draw.rectangle([bus_x, bus_y, bus_x + bus_width, bus_y + bus_height], 
                   fill=hex_to_rgb(YELLOW), outline=hex_to_rgb(DARK_GRAY), width=3)
    
    # Draw bus windows (simplified)
    window_y = bus_y + 20
    window_height = 40
    window_width = 45
    
    for i in range(3):
        window_x = bus_x + 30 + (i * 65)
        draw.rectangle([window_x, window_y, window_x + window_width, window_y + window_height],
                       fill=hex_to_rgb(BLUE), outline=hex_to_rgb(DARK_GRAY), width=2)
    
    # Draw wheels
    wheel_radius = 20
    wheel_y = bus_y + bus_height + 10
    wheel1_x = bus_x + 50
    wheel2_x = bus_x + bus_width - 50
    
    draw.ellipse([wheel1_x - wheel_radius, wheel_y - wheel_radius, 
                  wheel1_x + wheel_radius, wheel_y + wheel_radius],
                 fill=hex_to_rgb(DARK_GRAY), outline=hex_to_rgb(WHITE), width=2)
    draw.ellipse([wheel2_x - wheel_radius, wheel_y - wheel_radius, 
                  wheel2_x + wheel_radius, wheel_y + wheel_radius],
                 fill=hex_to_rgb(DARK_GRAY), outline=hex_to_rgb(WHITE), width=2)
    
    # Draw wheel centers
    draw.ellipse([wheel1_x - 5, wheel_y - 5, wheel1_x + 5, wheel_y + 5],
                 fill=hex_to_rgb(WHITE))
    draw.ellipse([wheel2_x - 5, wheel_y - 5, wheel2_x + 5, wheel_y + 5],
                 fill=hex_to_rgb(WHITE))
    
    img.save('play-store-assets/app-icon/app_icon_512x512.png')
    return "✓ App icon created"

def create_feature_graphic():
    """Create 1024x500 feature graphic"""
    print("Creating feature graphic (1024x500)...")
    
    width, height = 1024, 500
    
    # Create gradient background
    img = Image.new('RGB', (width, height), hex_to_rgb(DARK_BLUE))
    draw = ImageDraw.Draw(img)
    
    # Draw blue to darker blue gradient background
    for y in range(height):
        r = int(hex_to_rgb(DARK_BLUE)[0] + (hex_to_rgb(BLUE)[0] - hex_to_rgb(DARK_BLUE)[0]) * y / height)
        g = int(hex_to_rgb(DARK_BLUE)[1] + (hex_to_rgb(BLUE)[1] - hex_to_rgb(DARK_BLUE)[1]) * y / height)
        b = int(hex_to_rgb(DARK_BLUE)[2] + (hex_to_rgb(BLUE)[2] - hex_to_rgb(DARK_BLUE)[2]) * y / height)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    # Add decorative elements
    for i in range(5):
        circle_x = 100 + i * 150
        circle_y = 50
        circle_size = 80
        draw.ellipse([circle_x - circle_size, circle_y - circle_size, 
                      circle_x + circle_size, circle_y + circle_size],
                     outline=hex_to_rgb(YELLOW), width=3)
    
    # Add school bus icon on right side
    bus_x = width - 250
    bus_y = height // 3
    bus_width = 120
    bus_height = 80
    
    draw.rectangle([bus_x, bus_y, bus_x + bus_width, bus_y + bus_height],
                   fill=hex_to_rgb(YELLOW), outline=hex_to_rgb(WHITE), width=2)
    
    # Windows
    for i in range(2):
        wx = bus_x + 20 + (i * 45)
        draw.rectangle([wx, bus_y + 15, wx + 35, bus_y + 45],
                       fill=hex_to_rgb(BLUE), outline=hex_to_rgb(WHITE), width=1)
    
    # Wheels
    draw.ellipse([bus_x + 20 - 8, bus_y + bus_height + 5, bus_x + 20 + 8, bus_y + bus_height + 20],
                 fill=hex_to_rgb(DARK_GRAY))
    draw.ellipse([bus_x + bus_width - 20 - 8, bus_y + bus_height + 5, 
                  bus_x + bus_width - 20 + 8, bus_y + bus_height + 20],
                 fill=hex_to_rgb(DARK_GRAY))
    
    # Add text placeholders (you'll customize these)
    try:
        # Try to use a default font, fall back to default if not available
        font_large = ImageFont.load_default()
    except:
        font_large = ImageFont.load_default()
    
    # Add text (you can replace with actual text using custom font)
    draw.text((50, 200), "BusWay Pro", fill=hex_to_rgb(YELLOW), font=font_large)
    draw.text((50, 280), "School Bus Fee Manager", fill=hex_to_rgb(WHITE), font=font_large)
    draw.text((50, 350), "Secure • Simple • Smart", fill=hex_to_rgb(LIGHT_GRAY), font=font_large)
    
    img.save('play-store-assets/feature-graphic/feature_graphic_1024x500.png')
    return "✓ Feature graphic created"

def create_screenshots():
    """Create 5 screenshot templates (1242x2208 each)"""
    print("Creating screenshots (1242x2208)...")
    
    width, height = 1242, 2208
    screenshots = []
    
    # Screenshot 1: Dashboard
    print("  - Screenshot 1: Dashboard...")
    img = Image.new('RGB', (width, height), hex_to_rgb(WHITE))
    draw = ImageDraw.Draw(img)
    
    # Status bar
    draw.rectangle([0, 0, width, 50], fill=hex_to_rgb(BLUE))
    
    # Header
    draw.rectangle([0, 50, width, 200], fill=hex_to_rgb(LIGHT_GRAY))
    draw.text((30, 80), "Dashboard", fill=hex_to_rgb(DARK_BLUE))
    draw.text((30, 130), "School Bus Fee Management", fill=hex_to_rgb(DARK_GRAY))
    
    # Cards
    for i in range(3):
        card_y = 250 + (i * 250)
        draw.rectangle([30, card_y, width - 30, card_y + 180],
                       fill=hex_to_rgb(LIGHT_GRAY), outline=hex_to_rgb(BLUE), width=2)
        draw.text((50, card_y + 30), f"Card {i+1}", fill=hex_to_rgb(DARK_BLUE))
        draw.text((50, card_y + 80), "Details here", fill=hex_to_rgb(DARK_GRAY))
    
    img.save('play-store-assets/screenshots/screenshot_1_dashboard.png')
    screenshots.append("screenshot_1_dashboard.png")
    
    # Screenshot 2: Fee Payment
    print("  - Screenshot 2: Payment Screen...")
    img = Image.new('RGB', (width, height), hex_to_rgb(WHITE))
    draw = ImageDraw.Draw(img)
    
    draw.rectangle([0, 0, width, 50], fill=hex_to_rgb(BLUE))
    draw.rectangle([0, 50, width, 200], fill=hex_to_rgb(LIGHT_GRAY))
    draw.text((30, 80), "Payment", fill=hex_to_rgb(DARK_BLUE))
    
    # Payment form
    draw.rectangle([30, 250, width - 30, 350], fill=hex_to_rgb(LIGHT_GRAY), 
                   outline=hex_to_rgb(BLUE), width=2)
    draw.text((50, 270), "Amount Due: ₹5,000", fill=hex_to_rgb(DARK_BLUE))
    draw.text((50, 310), "Due Date: March 31, 2024", fill=hex_to_rgb(DARK_GRAY))
    
    # Payment button
    draw.rectangle([30, 400, width - 30, 500], fill=hex_to_rgb(YELLOW), 
                   outline=hex_to_rgb(DARK_GRAY), width=2)
    draw.text((width // 2 - 60, 430), "PAY NOW", fill=hex_to_rgb(DARK_BLUE))
    
    # Features
    for i, feature in enumerate(["Instant Payment", "Digital Receipt", "No Hidden Charges"]):
        feature_y = 600 + (i * 150)
        draw.ellipse([30, feature_y, 80, feature_y + 50], fill=hex_to_rgb(BLUE))
        draw.text((90, feature_y + 10), feature, fill=hex_to_rgb(DARK_BLUE))
    
    img.save('play-store-assets/screenshots/screenshot_2_payment.png')
    screenshots.append("screenshot_2_payment.png")
    
    # Screenshot 3: Bus Tracking
    print("  - Screenshot 3: Bus Tracking...")
    img = Image.new('RGB', (width, height), hex_to_rgb(WHITE))
    draw = ImageDraw.Draw(img)
    
    draw.rectangle([0, 0, width, 50], fill=hex_to_rgb(BLUE))
    draw.rectangle([0, 50, width, 150], fill=hex_to_rgb(LIGHT_GRAY))
    draw.text((30, 70), "Bus Tracking", fill=hex_to_rgb(DARK_BLUE))
    
    # Map area (placeholder)
    draw.rectangle([30, 200, width - 30, 1000], fill=hex_to_rgb(LIGHT_GRAY), 
                   outline=hex_to_rgb(BLUE), width=2)
    draw.text((width // 2 - 100, 500), "📍 Map View", fill=hex_to_rgb(DARK_GRAY))
    draw.text((width // 2 - 150, 600), "Real-time Bus Location", fill=hex_to_rgb(DARK_BLUE))
    
    # Bus info
    draw.rectangle([30, 1100, width - 30, 1300], fill=hex_to_rgb(LIGHT_GRAY), 
                   outline=hex_to_rgb(BLUE), width=2)
    draw.text((50, 1130), "Bus YZ-01", fill=hex_to_rgb(DARK_BLUE))
    draw.text((50, 1180), "Speed: 45 km/h | ETA: 5 mins", fill=hex_to_rgb(DARK_GRAY))
    
    img.save('play-store-assets/screenshots/screenshot_3_tracking.png')
    screenshots.append("screenshot_3_tracking.png")
    
    # Screenshot 4: Attendance
    print("  - Screenshot 4: Attendance...")
    img = Image.new('RGB', (width, height), hex_to_rgb(WHITE))
    draw = ImageDraw.Draw(img)
    
    draw.rectangle([0, 0, width, 50], fill=hex_to_rgb(BLUE))
    draw.rectangle([0, 50, width, 150], fill=hex_to_rgb(LIGHT_GRAY))
    draw.text((30, 70), "Attendance", fill=hex_to_rgb(DARK_BLUE))
    
    # Attendance data
    draw.text((30, 200), "March 2024", fill=hex_to_rgb(DARK_BLUE))
    
    for day in range(1, 22):
        row = (day - 1) // 5
        col = (day - 1) % 5
        x = 50 + (col * 180)
        y = 300 + (row * 120)
        
        # Attendance box
        draw.rectangle([x, y, x + 150, y + 80], fill=hex_to_rgb(LIGHT_GRAY), 
                       outline=hex_to_rgb(BLUE), width=1)
        draw.text((x + 20, y + 15), f"Day {day}", fill=hex_to_rgb(DARK_BLUE))
        draw.text((x + 20, y + 45), "✓ Present", fill=hex_to_rgb(BLUE))
    
    img.save('play-store-assets/screenshots/screenshot_4_attendance.png')
    screenshots.append("screenshot_4_attendance.png")
    
    # Screenshot 5: Settings
    print("  - Screenshot 5: Settings...")
    img = Image.new('RGB', (width, height), hex_to_rgb(WHITE))
    draw = ImageDraw.Draw(img)
    
    draw.rectangle([0, 0, width, 50], fill=hex_to_rgb(BLUE))
    draw.rectangle([0, 50, width, 150], fill=hex_to_rgb(LIGHT_GRAY))
    draw.text((30, 70), "Settings", fill=hex_to_rgb(DARK_BLUE))
    
    # Settings items
    settings = [
        "Profile Settings",
        "Notifications",
        "Privacy & Security",
        "Payment Methods",
        "Help & Support",
        "Logout"
    ]
    
    for i, setting in enumerate(settings):
        setting_y = 200 + (i * 200)
        draw.rectangle([30, setting_y, width - 30, setting_y + 150],
                       fill=hex_to_rgb(LIGHT_GRAY), outline=hex_to_rgb(BLUE), width=2)
        draw.text((50, setting_y + 40), setting, fill=hex_to_rgb(DARK_BLUE))
        draw.text((50, setting_y + 90), "Tap to configure →", fill=hex_to_rgb(DARK_GRAY))
    
    img.save('play-store-assets/screenshots/screenshot_5_settings.png')
    screenshots.append("screenshot_5_settings.png")
    
    return f"✓ Created {len(screenshots)} screenshots"

def main():
    """Generate all Play Store assets"""
    print("\n" + "="*60)
    print("BusWay Pro - Google Play Store Assets Generator")
    print("="*60 + "\n")
    
    try:
        # Create assets directory if needed
        os.makedirs('play-store-assets/app-icon', exist_ok=True)
        os.makedirs('play-store-assets/feature-graphic', exist_ok=True)
        os.makedirs('play-store-assets/screenshots', exist_ok=True)
        
        # Generate all assets
        results = []
        results.append(create_app_icon())
        results.append(create_feature_graphic())
        results.append(create_screenshots())
        
        print("\n" + "="*60)
        print("✓ ALL ASSETS CREATED SUCCESSFULLY!")
        print("="*60)
        for result in results:
            print(result)
        
        print("\n📁 Files location:")
        print("   - App Icon: play-store-assets/app-icon/")
        print("   - Feature Graphic: play-store-assets/feature-graphic/")
        print("   - Screenshots: play-store-assets/screenshots/")
        print("\n✨ Next: Upload these to Google Play Console!")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print("Make sure PIL (Pillow) is installed: pip install Pillow")
        exit(1)

if __name__ == "__main__":
    main()

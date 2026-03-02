from PIL import Image
import os

d = "/Users/reidsurmeier/Meta_Finder/18_Code Base/PersonalWebsite/public/"
fname = [f for f in os.listdir(d) if "10.29" in f and f.endswith(".png")][0]
orig = Image.open(os.path.join(d, fname)).convert("RGBA")
w, h = orig.size
print(f"Original: {w}x{h}")

pixels = orig.load()
cx = w // 2

# Find bezel edges
def is_bezel(r, g, b, a):
    return a > 100 and (r + g + b) / 3 < 100

phone_top = 0
for y in range(h):
    if is_bezel(*pixels[cx, y]):
        phone_top = y
        break

phone_left = 0
for x in range(w):
    if is_bezel(*pixels[x, h // 2]):
        phone_left = x
        break

phone_right = w - 1
for x in range(w - 1, 0, -1):
    if is_bezel(*pixels[x, h // 2]):
        phone_right = x
        break

# Find where screen content starts (first white pixel from top at center)
screen_top = phone_top
for y in range(phone_top, h // 2):
    r, g, b, a = pixels[cx, y]
    if r > 200 and g > 200 and b > 200:
        screen_top = y
        break

screen_left = phone_left
for x in range(phone_left, cx):
    r, g, b, a = pixels[x, h // 2]
    if r > 200 and g > 200 and b > 200:
        screen_left = x
        break

screen_right = phone_right
for x in range(phone_right, cx, -1):
    r, g, b, a = pixels[x, h // 2]
    if r > 200 and g > 200 and b > 200:
        screen_right = x
        break

print(f"Screen: left={screen_left}, top={screen_top}, right={screen_right}")
print(f"Screen width: {screen_right - screen_left}")

# The status bar is from screen_top to about screen_top + 40px (at this resolution)
# Look for where the first content text starts (scan for dark non-bezel pixels below status bar)
status_bar_height = 44  # Standard iOS status bar at this scale

# Crop the status bar region from the original image
# Include full screen width
bar_top = screen_top
bar_bottom = screen_top + status_bar_height
bar = orig.crop((screen_left, bar_top, screen_right, bar_bottom))
bar.save(os.path.join(d, "phone-statusbar.png"))
print(f"Status bar saved: {bar.size[0]}x{bar.size[1]}")

# Also regenerate the phone frame with wider bezel
# Re-extract with more generous screen cutout (more inset = wider bezel)
frame_img = orig.copy()

from PIL import ImageDraw

# Pad for cropping
pad = 10
cl = max(0, phone_left - pad)
ct = max(0, phone_top - pad)

phone_bottom = 0
for y in range(h - 1, 0, -1):
    if is_bezel(*pixels[cx, y]):
        phone_bottom = y
        break

cr = min(w, phone_right + pad)
cb = min(h, phone_bottom + pad)

# Create mask — make screen area transparent but with wider bezel (more inset)
mask = Image.new("L", (w, h), 255)
draw = ImageDraw.Draw(mask)

# Inset for visible bezel — 3px gives clean bezel without corner artifacts
inset = 3
corner_radius = 40  # Match phone's inner screen corners

screen_bottom = phone_bottom
for y in range(phone_bottom, h // 2, -1):
    r, g, b, a = pixels[cx, y]
    if r > 200 and g > 200 and b > 200:
        screen_bottom = y
        break

draw.rounded_rectangle(
    [screen_left + inset, screen_top + inset, screen_right - inset, screen_bottom - inset],
    radius=corner_radius,
    fill=0
)

# Apply
result = orig.copy()
for y in range(h):
    for x in range(w):
        if mask.getpixel((x, y)) == 0:
            result.putpixel((x, y), (0, 0, 0, 0))

frame = result.crop((cl, ct, cr, cb))
frame.save(os.path.join(d, "phone-frame.png"))
print(f"Frame saved: {frame.size[0]}x{frame.size[1]}")

# New screen coordinates relative to cropped frame
rel_sl = screen_left + inset - cl
rel_st = screen_top + inset - ct
rel_sr = screen_right - inset - cl
rel_sb = screen_bottom - inset - ct
fw, fh = frame.size
print(f"\nCSS percentages (with wider bezel):")
print(f"  left: {rel_sl/fw*100:.2f}%")
print(f"  top: {rel_st/fh*100:.2f}%")
print(f"  width: {(rel_sr - rel_sl)/fw*100:.2f}%")
print(f"  height: {(rel_sb - rel_st)/fh*100:.2f}%")
print(f"  right: {(fw - rel_sr)/fw*100:.2f}%")
print(f"  bottom: {(fh - rel_sb)/fh*100:.2f}%")

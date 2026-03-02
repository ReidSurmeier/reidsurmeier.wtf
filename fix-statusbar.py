from PIL import Image
import os

d = "/Users/reidsurmeier/Meta_Finder/18_Code Base/PersonalWebsite/public/"
img = Image.open(os.path.join(d, "phone-statusbar.png")).convert("RGBA")
pixels = img.load()
w, h = img.size

# Make white/light pixels transparent, keep dark pixels (text, icons)
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        # If pixel is light (white/near-white background), make transparent
        brightness = (r + g + b) / 3
        if brightness > 180:
            pixels[x, y] = (r, g, b, 0)
        elif brightness > 120:
            # Semi-transparent for anti-aliased edges
            alpha = int(255 * (1 - (brightness - 120) / 60))
            pixels[x, y] = (r, g, b, min(a, alpha))

img.save(os.path.join(d, "phone-statusbar.png"))
print(f"Status bar made transparent: {w}x{h}")

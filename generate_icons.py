#!/usr/bin/env python3
"""
Script pour générer les icônes PNG à partir du SVG
"""

import os
from PIL import Image, ImageDraw, ImageFont

# Créer le dossier icons s'il n'existe pas
os.makedirs('icons', exist_ok=True)

# Tailles nécessaires
sizes = [72, 96, 128, 144, 152, 192, 384, 512]

print("Génération des icônes PNG pour Pharmacy Delivery Réunion")
print("=" * 60)

try:
    for size in sizes:
        # Créer une image carrée avec fond bleu
        img = Image.new('RGBA', (size, size), (23, 162, 184, 255))
        draw = ImageDraw.Draw(img)
        
        # Dessiner un cercle blanc
        center = size // 2
        radius = size // 2 - size // 20
        draw.ellipse([(center-radius, center-radius), (center+radius, center+radius)], 
                   fill=(255, 255, 255, 255))
        
        # Ajouter du texte (PD pour Pharmacy Delivery)
        text = "PD"
        try:
            font_size = size // 3
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            font = ImageFont.load_default()
            font_size = size // 5
        
        # Utiliser textbbox pour les nouvelles versions de Pillow
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        text_x = (size - text_width) // 2
        text_y = (size - text_height) // 2
        
        # Dessiner le texte en bleu
        draw.text((text_x, text_y), text, fill=(23, 162, 184, 255), font=font)
        
        # Sauvegarder
        filename = f'icons/icon-{size}x{size}.png'
        img.save(filename)
        print(f"  ✓ {filename} généré")
    
    print("\n✅ Toutes les icônes ont été générées avec succès !")
    
except ImportError as e:
    print(f"\n❌ Erreur: {e}")
    print("   Pillow n'est pas installé.")
    print("   Installez-le avec: pip install pillow")
    print("\n📌 Méthode alternative:")
    print("   1. Allez sur https://realfavicongenerator.net/")
    print("   2. Téléchargez icons/icon.svg")
    print("   3. Générez les icônes")
    print("   4. Téléchargez le ZIP")
    print("   5. Extrayez les PNG dans le dossier icons/")
except Exception as e:
    print(f"\n❌ Erreur: {e}")
    print("\n📌 Méthode alternative:")
    print("   1. Allez sur https://realfavicongenerator.net/")
    print("   2. Téléchargez icons/icon.svg")
    print("   3. Générez les icônes")
    print("   4. Téléchargez le ZIP")
    print("   5. Extrayez les PNG dans le dossier icons/")

# 🖼️ Image Compressor

Jednoduchá webová aplikace pro kompresi obrázků bez ztráty kvality.

## 🚀 Funkce

- Drag & drop upload obrázků
- Automatická komprese s optimální kvalitou
- Podpora moderních formátů: JPG, PNG, WebP, HEIC, AVIF
- Inteligentní výběr výstupního formátu (PNG pro transparentní obrázky, JPG pro fotky)
- Vizuální porovnání před/po
- Zobrazení ušetřené velikosti

## 📦 Instalace

```bash
npm install
```

## 🏃 Spuštění

```bash
npm run dev
```

Aplikace poběží na `http://localhost:5173`

## 🔧 Build

```bash
npm run build
npm run preview
```

## 🛠️ Technologie

- **SvelteKit** - Frontend framework
- **Sharp** - Knihovna pro zpracování obrázků (libvips)
- **mozjpeg** - Optimalizovaná JPG komprese

## 💡 Jak to funguje

1. Nahraješ obrázek
2. Sharp načte metadata a rozhodne, jestli je lepší PNG nebo JPG
3. Obrázek se zkomprimuje s optimální kvalitou:
   - PNG: kvalita 90, compressionLevel 9
   - JPG: kvalita 85, mozjpeg optimalizace
4. Stáhneš komprimovaný obrázek

## 📝 Poznámky

- HEIC support závisí na dostupných kodecích v systému
- Sharp automaticky konvertuje všechny podporované formáty
- Transparentní obrázky jsou vždy uloženy jako PNG
- Fotky jsou kompresi optimalizovány jako JPG

## 👨‍💻 Autor

Pavel Tajduš - Hotend.cz

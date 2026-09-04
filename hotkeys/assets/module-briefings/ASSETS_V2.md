# VIDLIK briefing v2 — assets

Код для нового брифінгу сектору 01 вже підготовлений. Потрібно лише додати графіку за цими шляхами:

```text
hotkeys/assets/module-briefings/
├── sector-01-folder.png
├── stamp-passed.png
└── numbers/
    ├── number-0-small.svg
    ├── number-1-small.svg
    ├── number-2-small.svg
    ├── number-3-small.svg
    ├── number-4-small.svg
    ├── number-5-small.svg
    ├── number-6-small.svg
    ├── number-7-small.svg
    ├── number-8-small.svg
    └── number-9-small.svg
```

## Вимоги

- `sector-01-folder.png` — прозорий фон, очікуване співвідношення сторін **1951:806**.
- `stamp-passed.png` — прозорий PNG із печаткою `ПРОЙДЕНО`.
- цифри — SVG 0–9.

До завантаження нового `sector-01-folder.png` код тимчасово використовує старий `module-01.webp` як fallback. Якщо SVG-цифр немає, показуються текстові номери. Печатка показується лише при 100% проходженні модуля.

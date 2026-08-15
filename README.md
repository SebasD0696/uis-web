# Visor RGB + Máscaras de segmentación (cobertura arbórea)

Mapa interactivo (Leaflet) que muestra ortomosaicos RGB con las máscaras binarias de
segmentación de cobertura arbórea superpuestas, para 4 años: **2016, 2021, 2023 y 2025**.

Disponible en línea en GitHub Pages.

## Uso

- **Línea de tiempo** (abajo): cambia el año (2016 → 2021 → 2023 → 2025).
- **Máscara de segmentación** (arriba derecha): selecciona el modelo
  **SegFormer B0 (Ours)** o **SegFormer B5**, y activar/desactivar, opacidad y color
  (rojo, verde, azul o amarillo).
- **Estadísticas** (arriba izquierda): % de cobertura arbórea y área arbolada por año,
  calculadas con el GSD real de cada año y referidas al área cubierta por el ortomosaico.
  Se actualizan según el modelo seleccionado.
- **Control de capas** (abajo): fondo OpenStreetMap o "Sin fondo".
- En pantallas pequeñas (≤700 px) la interfaz se apila y compacta automáticamente.

## Estadísticas de cobertura arbórea

Cobertura sobre el área cubierta por el ortomosaico, según el modelo seleccionado.

### SegFormer B0 (Ours)

| Año | GSD (cm/px) | Cobertura | Área arbolada |
|-----|-------------|-----------|---------------|
| 2016 | 5.55 | 31.06 % | 78 972 m² (7.90 ha) |
| 2021 | 5.13 | 29.00 % | 74 391 m² (7.44 ha) |
| 2023 | 4.89 | 28.98 % | 74 247 m² (7.42 ha) |
| 2025 | 2.71 | 34.71 % | 88 973 m² (8.90 ha) |

### SegFormer B5

| Año | GSD (cm/px) | Cobertura | Área arbolada |
|-----|-------------|-----------|---------------|
| 2016 | 5.55 | 31.75 % | 80 719 m² (8.07 ha) |
| 2021 | 5.13 | 31.86 % | 81 734 m² (8.17 ha) |
| 2023 | 4.89 | 32.38 % | 82 966 m² (8.30 ha) |
| 2025 | 2.71 | 33.15 % | 84 983 m² (8.50 ha) |

## Estructura

```
index.html          # visor Leaflet (todo el CSS/JS inline, CDN de unpkg)
estadisticas.json   # datos de estadísticas calculados (calcular_estadisticas.py)
LEEME.txt           # notas de uso/regeneración
<anio>/rgb/         # teselas RGB (PNG, esquema TMS, z10–20)
<anio>/mask/        # teselas de máscara coloreada SegFormer B0 (PNG, esquema TMS, z10–20)
<anio>/mask_segformerb5/   # teselas de máscara coloreada SegFormer B5 (PNG, esquema TMS, z10–20)
masks_segformerb5_<anio>/  # máscaras binarias crudas (TIFF) del modelo SegFormer B5
```

## Ejecutar localmente

Requiere internet para el CDN de Leaflet y el fondo OpenStreetMap.

```powershell
python -m http.server 8000 --directory tiles_web
```

Abrir `http://localhost:8000`.

## Notas técnicas

- Las teselas se generan con `gdal2tiles` (esquema **TMS**, por eso Leaflet usa `tms: true`).
- El 2023 vino como RGB de 3 bandas; se le añadió canal alfa (negro puro → transparente)
  mediante `add_alpha_to_rgb.py`.
- Las máscaras (0/255) se colorearon con `mask_to_rgba.py`.
- El % de cobertura se calcula sobre el área realmente cubierta por el ortomosaico
  (píxeles con datos), no sobre el rectángulo total.

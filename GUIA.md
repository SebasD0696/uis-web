# Guia del Visor de Cobertura Arborea

## Como funciona la pagina

La pagina (`index.html`) es un visor Leaflet que carga teselas PNG organizadas en el esquema TMS (zoom 10-20) para el RGB y las mascaras de los modelos SegFormer B0 y B5. El marcado vive en `index.html`, los estilos en `css/styles.css` y la logica en `js/` (Leaflet se carga por CDN de unpkg). No requiere build ni dependencias instaladas.

### Capas disponibles

| Capa | Ruta | Contenido |
|------|------|-----------|
| RGB | `<anio>/rgb/{z}/{x}/{y}.png` | Ortomosaico RGB |
| SegFormer B0 (Ours) | `<anio>/mask/{z}/{x}/{y}.png` | Mascara binaria coloreada (modelo original) |
| SegFormer B0 v2 (Ours) | `<anio>/mask_segformerb0v2/{z}/{x}/{y}.png` | Mascara binaria coloreada (modelo mejorado) |
| SegFormer B5 | `<anio>/mask_segformerb5/{z}/{x}/{y}.png` | Mascara binaria coloreada (modelo B5) |

Los anos disponibles son **2016, 2021, 2023 y 2025**.

### Interfaz

- **Linea de tiempo** (abajo): cambia el ano activo.
- **Panel de mascara** (arriba derecha): selecciona el modelo, activa/desactiva, ajusta opacidad y color (rojo, verde, azul, amarillo).
- **Estadisticas** (arriba izquierda): muestra el logo del proyecto y la cobertura arborea (%) y area arbolada (m² y ha) por ano, segun el modelo seleccionado.
- **Control de capas** (abajo izquierda): elige fondo satelital (Esri) o "Sin fondo".
- En pantallas chicas (<=700 px) las estadisticas y los controles se abren en un panel deslizante inferior, con botones tactiles. La linea de tiempo queda siempre visible.

### Superposicion

Para ver la mascara superpuesta sobre el RGB:

1. Selecciona el ano en la linea de tiempo.
2. En el panel de mascara, elige el modelo (B0 o B5).
3. Haz clic en "Mascara: activada" para encenderla.
4. Ajusta la opacidad con el deslizador.
5. Cambia el color con los circulos de swatch.

Tambien puedes combinar capas de distinto ano desde el control de capas, por ejemplo la mascara de 2025 sobre el RGB de 2016.

---

## Como se crean las teselas

### Teselas RGB y mascaras coloreadas (mask, mask_segformerb5, mask_segformerb0v2)

Se generan con **gdal2tiles** en esquema TMS:

```bash
gdal2tiles.py -z 10-20 -p mercator --tms tif_salida.tif carpeta_destino/
```

Esto produce la estructura `carpeta_destino/{z}/{x}/{y}.png` con tiles de 256x256 px.

### Teselas de mascaras v2 (mask_segformerb0v2)

Las mascaras v2 se generan a partir de los TIFFs crudos en `masks_v2_<anio>/`. Cada directorio contiene teselas GeoTIFF en EPSG:3116 con valores 0 (fondo) y 255 (arbol): 512x512 px para 2016/2021/2023 y 1024x1024 px para 2025.

El proceso es:

1. **Merge**: unir todas las teselas GeoTIFF de un ano en un solo mosaico.
2. **Reproyeccion**: convertir el mosaico de EPSG:3116 a EPSG:3857 (Web Mercador).
3. **Generacion de teselas TMS**: para cada nivel de zoom (10-20), calcular las coordenadas de tesela con `mercantile`, reproyectar la porcion correspondiente y guardar como PNG.
4. **Tilemapresource.xml**: generar el descriptor XML del servicio de teselas.

El resultado se almacena en `<anio>/mask_segformerb0v2/` con la misma estructura TMS.

```python
# Script ejemplo (ver generacion en la sesion de trabajo)
import rasterio, mercantile, numpy as np
from rasterio.merge import merge
from rasterio.warp import calculate_default_transform, reproject, Resampling

# 1. Merge
src_files = [rasterio.open(f) for f in glob("masks_v2_2016/*.tif")]
mosaic, transform = merge(src_files)

# 2. Reproyeccion a EPSG:3857
reproject(source=mosaic, dst_crs="EPSG:3857", ...)

# 3. Para cada zoom y tesela:
for tile in mercantile.tiles(lon_min, lat_min, lon_max, lat_max, z):
    tms_y = 2**z - 1 - tile.y   # convertir XYZ a TMS
    # reproyectar la porcion de la fuente a la tesela 256x256
    # guardar como PNG
```

### Estadisticas

Se calculan contando pixeles con valor 255 (arbol) sobre el total de pixeles validos, multiplicando por el area real de cada pixel (GSD^2):

| Ano | GSD (cm/px) |
|-----|-------------|
| 2016 | 5.55 |
| 2021 | 5.13 |
| 2023 | 4.89 |
| 2025 | 2.71 |

Los resultados se guardan en `estadisticas.json` y `estadisticas_masks_v2.json`.

---

## Estructura del repositorio

```
index.html                      # Marcado del visor Leaflet
css/styles.css                  # Estilos base + responsive
js/config.js                    # Constantes: anos, modelos, stats, bounds, teselas
js/map-view.js                  # Mapa, capas y control de capas
js/stats.js                     # Tabla de estadisticas
js/controls.js                  # Panel de mascara, timeline y drawer movil
js/main.js                      # Arranque
logo/                           # Logo del proyecto (pequeno, en Estadisticas)
estadisticas.json               # Stats mascaras originales
estadisticas_masks_v2.json      # Stats mascaras v2
<anio>/rgb/                     # Teselas RGB (TMS, z10-20)
<anio>/mask/                    # Teselas mascara B0 original (TMS, z10-20)
<anio>/mask_segformerb5/        # Teselas mascara B5 (TMS, z10-20)
<anio>/mask_segformerb0v2/      # Teselas mascara B0 v2 (TMS, z10-20)
masks_v2_<anio>/                # Mascara binaria cruda (TIFF, EPSG:3116)
```

## Ejecutar localmente

```bash
python -m http.server 8000
```

Abrir `http://localhost:8000`. Se necesita internet para el CDN de Leaflet y el fondo satelital.

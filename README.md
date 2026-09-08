# WRF Domain Wizard

Interactive WRF/WPS domain planning tool for quickly designing nested domains and generating a starter `namelist.wps`.

## Features

- Interactive Leaflet map
- 1–3 nested domains
- Lambert Conformal, Mercator and Lat-Lon map projections
- Configurable `dx` / `dy`
- Domain center/reference latitude and longitude
- Standard 3:1 nesting ratio with validation
- Automatic `e_we` / `e_sn` estimation from geographic extent
- Automatic parent start indices
- WPS `&share`, `&geogrid`, `&ungrib`, and `&metgrid` sections
- Editable domain rectangles
- Basic grid/nesting validation before export

## Important scientific note

The generated file is a **planning/starter namelist**, not a replacement for `geogrid.exe`. For a production WRF experiment, verify the selected projection, grid spacing, nesting alignment, domain dimensions, geographic data resolution, and WPS/WRF version requirements before running WPS.

For nested domains, `parent_grid_ratio` defaults to 3. Child dimensions are checked for compatibility with the parent grid and the child start indices are calculated from the geographic centers.

## Usage

1. Open `index.html` in a browser or deploy the repository with GitHub Pages/Netlify.
2. Zoom the map to the intended parent-domain region.
3. Select the number of domains.
4. Select a projection and set `dx`/`dy`.
5. Set the reference latitude/longitude if desired, or use the parent-domain center.
6. Click **Draw Domains**.
7. Edit rectangles if necessary.
8. Review validation messages.
9. Export `namelist.wps`.

## Projection guidance

- **Lambert Conformal (lambert):** commonly used for mid-latitude/regional WRF domains. Set `truelat1`, `truelat2`, and `stand_lon` appropriately.
- **Mercator (mercator):** useful for tropical and equatorial regional domains.
- **Lat-Lon (lat-lon):** retained mainly for compatibility/planning; confirm that it is appropriate for your experiment.

## Terrain / geographic data

`geog_data_res` is selectable in the UI. The tool writes the chosen resolution into the WPS namelist but does not download or bundle terrain data. Configure `geog_data_path` to the actual WPS geographic-data directory on your system.

## Validation

The browser performs sanity checks for:

- positive grid spacing
- valid latitude/longitude
- projection-specific parameters
- sufficient grid dimensions
- nested-domain containment
- 3:1 nesting compatibility
- parent start indices

Always validate the final file with your installed WPS tools before a scientific simulation.

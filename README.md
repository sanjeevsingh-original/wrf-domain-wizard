# WRF Domain Wizard

Interactive WRF/WPS domain-design and `namelist.wps` planning tool for atmospheric-modeling research.

## What it does

- Draw **1–10 nested domains** directly on an interactive map.
- Enforce sequential parent/child containment.
- Set an **independent integer nesting ratio (2:1–10:1) for every child domain**.
- Automatically flag even ratios because odd ratios are generally preferred for two-way nesting.
- Support Lambert Conformal, Mercator, Polar Stereographic and Lat-Lon projections.
- Use projection-aware horizontal grid calculations through `proj4js` for projected grids.
- Calculate grid dimensions, child grid spacing and parent start indices.
- Snap nested `e_we`/`e_sn` to parent-grid-ratio compatibility.
- Show validation errors and scientific warnings before export.
- Estimate total horizontal grid-cell count for planning computational demand.
- Configure `start_date`, `end_date`, `interval_seconds` and `geog_data_path` instead of silently using production-like placeholders.
- Export a WPS `namelist.wps` containing `&share`, `&geogrid`, `&ungrib` and `&metgrid` sections.
- Provide editable rectangles so the researcher can refine each domain interactively.

## Recommended workflow

1. Select the number of domains (1–10).
2. Choose **Draw manually** or **Auto-nest from d01**.
3. Set each parent→child nesting ratio. Use 3:1 or 5:1 unless your experiment has a reason to use another integer ratio.
4. Select the WRF/WPS map projection and set `dx`/`dy` for d01.
5. Set projection parameters and reference coordinates.
6. Draw d01, then d02, d03, etc. Each child must be fully contained within its parent.
7. Edit rectangles if necessary.
8. Enter the actual WPS simulation dates, forcing interval and geographic-data path.
9. Review all errors and warnings.
10. Export `namelist.wps`.
11. **Run the generated file through your installed WPS `geogrid.exe` and inspect the resulting `geo_em.d0*.nc` files before a scientific simulation.**

## Scientific scope and limitations

This project is a **domain-design and configuration assistant**, not a replacement for WPS. Browser calculations reproduce the intended projection/grid relationships for planning, but exact WPS behavior also depends on the WPS/WRF version, map-projection implementation, static-data packages, and the final `geogrid.exe` execution.

In particular, the map rectangle is a geographic drawing interface while WRF grids are defined in the selected projection. The application therefore performs projection-aware calculations for grid dimensions and nesting indices, but final domain placement and static-data availability must be verified with WPS itself.

The tool does not download or bundle WPS geographic data. `geog_data_path` must point to a valid local WPS geographic-data directory on the machine running WPS.

The displayed grid-cell count is a horizontal-cell estimate. Actual WRF memory, runtime, MPI decomposition and I/O requirements depend on vertical levels, physics, nesting mode, output frequency, hardware and other model settings.

## WPS variables generated

The export includes the principal domain variables:

- `max_dom`
- `parent_id`
- `parent_grid_ratio`
- `i_parent_start`
- `j_parent_start`
- `e_we`
- `e_sn`
- `dx`, `dy`
- `map_proj`
- `ref_lat`, `ref_lon`, `stand_lon`
- projection-specific true latitude parameters
- `geog_data_res`
- `geog_data_path`
- WPS date/interval settings

## Reproducibility

For a paper, thesis or project, record at minimum:

- WRF/WPS version and commit/release where relevant
- domain projection and all projection parameters
- d01 `dx`/`dy`
- every parent→child `parent_grid_ratio`
- `e_we`, `e_sn`, `i_parent_start`, `j_parent_start`
- geographic-data package/version and path configuration
- simulation dates and forcing interval
- final `namelist.wps`
- successful `geogrid.exe` output and `geo_em` files

The repository includes `CITATION.cff` so the software can be cited as research software.

## License

MIT. See `CITATION.cff` for citation metadata.

config.defines.common = {
  input_file_paths: {
    angel_subdivisions: "./input/angel/angel_subdivisions.png",
    buringh_cities: "./input/buringh/European urban population, 700 - 2000.txt",
    chandler_modelski_csvs: {
      chandler: "./input/chandler/chandler.csv",
      chandler_v2: "./input/chandler/chandlerV2.csv",
      modelski_ancient: "./input/modelski/modelskiAncient.csv",
      modelski_ancient_v2: "./input/modelski/modelskiAncientV2.csv",
      modelski_modern: "./input/modelski/modelskiModern.csv",
      modelski_modern_v2: "./input/modelski/modelskiModernV2.csv",
    },
    clark_subdivisions: "./input/clark/clark_subdivisions.png",
    devries_cities: "./input/devries/europop.csv",
    devries_coords: "./input/devries/city_coords.csv",
    flattened_stadester_cities: `./input/uud/flattened_stadester_cities.json`,
    hyde_population: `./input/hyde/population/`,
      hyde_substrata_prefix: `substrata_pop__`,
    populstat_cities: "./input/populstat_cities/populstat_cities.json",
    processed_uud_cities: "./input/uud/processed_uud_cities.json",
    stadester_areas: `./input/uud/stadester_areas.json`,
    stadester_output: `./input/uud/stadester.json`,
    stadester_cities: `./input/uud/stadester_cities.json`,
    processed_stadester_cities: `./input/uud/processed_stadester_cities.json`,
    uud_cities: "./input/uud/uud_cities.json",
    
    ghsl_folder: "./input/GHSL/geojson/",
    ghsl_population_folder: "./input/GHSL/population_rasters",
    ghsl_population_prefix: "GHS_POP_",
    ghsl_population_suffix: ".png",
    ghsl_urban_areas_prefix: "GHS_urban_",
    
    substrata_folder: `./inut/hyde/population`,
    substrata_prefix: `substrata_pop__`,
    substrata_suffix: `_number.png`
  },
  output_file_paths: {
    ghsl_urban_areas_folder: "./input/GHSL/urban_area_rasters/",
    ghsl_urban_areas_prefix: "GHS_urban_"
  },

  prefix: "Stadestér",
  startup_message: "Stadestér. Type 'help' for help."
}

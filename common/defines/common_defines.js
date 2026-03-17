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
		hyde_land_area: "./input/hyde/land_area.png/",
    hyde_population: `./input/hyde/population/`,
    populstat_cities: "./input/populstat_cities/populstat_cities.json",
    processed_uud_cities: "./input/uud/processed_uud_cities.json",
    stadester_areas: `./input/uud/stadester_areas.json`,
    stadester_output: `./input/uud/stadester.json`,
    stadester_cities: `./input/uud/stadester_cities.json`,
    processed_stadester_cities: `./input/uud/processed_stadester_cities.json`,
    uud_cities: "./input/uud/uud_cities.json",
		worldcitypop_cities: "./input/worldcitypop/chandler_modelski_cities.json",
    
    ghsl_csv: "./input/GHSL/GHS_UCDB_MTUC_GLOBE_R2024A.csv",
    ghsl_folder: "./input/GHSL/geojson/",
    ghsl_population_folder: "./input/GHSL/population_rasters/",
    ghsl_population_prefix: "GHS_POP_",
    ghsl_population_suffix: ".png",
    ghsl_urban_areas_folder: "./input/GHSL/urban_area_rasters/",
    ghsl_urban_areas_prefix: "GHS_urban_",
    ghsl_urban_areas_suffix: ".png",
    
    regions_file_path: "./input/regional_subdivisions.png",
		voronoi_regions_file_path: "./input/voronoi_subdivisions.png",
    substrata_folder: `./input/hyde/population/`,
    substrata_prefix: `popc_`,
    substrata_suffix: ``,
		
		//Velkscala
		velkscala_northern_america_folder: "./input/velkscala/northern_america/intermediate_images/",
  },
  output_file_paths: {
    ghsl_output: "./output/ghsl.json",
    ghsl_urban_areas_folder: "./input/GHSL/urban_area_rasters/",
    ghsl_urban_areas_prefix: "GHS_urban_",
    ghsl_urban_folder: "./input/GHSL/urban_rasters/",
    ghsl_urban_prefix: "GHSL_",
    
		stadester_ghsl: "./output/stadester_ghsl.json",
		stadester_ghsl_non_metro: "./output/stadester_ghsl_non_metro.json",
		
		//RASTERS
		//Stadestér-Base
		stadester_base_rasters_folder: "./output/stadester_base_rasters/",
		stadester_base_rasters_prefix: "stadester_base_",
		//Stadestér-GHSL
    stadester_ghsl_rasters_folder: "./output/stadester_ghsl_rasters/",
		stadester_ghsl_rasters_prefix: "stadester_ghsl_",
		//Stadestér Rural
		stadester_rural_rasters_folder: "./output/stadester_rural_rasters/",
		stadester_rural_rasters_prefix: "stadester_rural_",
		//Stadestér Urban
		stadester_urban_rasters_folder: "./output/stadester_urban_rasters/",
		stadester_urban_rasters_prefix: "stadester_urban_",
		
		//Stadestér Population
		stadester_population_rasters_folder: "./output/stadester_population_rasters/",
		stadester_population_rasters_prefix: "stadester_population_",
    
    //Stadester Visualisations
    regional_cogs_base: "./output/regional_cogs_base.json",
    regional_cogs_ghsl: "./output/regional_cogs_ghsl.json",
		
		//2. Background
		urban_rural_population_csv: "./output/stadester_visualisations/2.background/global_urban_rural_population.csv",
		
		//4. Testing and Validation
		angel_30_table: "./output/stadester_visualisations/4.testing_and_validation/angel_30.csv",
		hyde_urbanisation_csv: "./output/stadester_visualisations/4.testing_and_validation/urban_and_rural_population.csv",
		top_120_table: "./output/stadester_visualisations/4.testing_and_validation/stadester_top_120.json",
		
		//6. Results
		population_json: "./output/stadester_visualisations/6.results/population.json",
		region_population_totals: "./output/stadester_visualisations/6.results/regional_population_totals.json",
		regional_datapoints: "./output/stadester_visualisations/6.results/regional_datapoints.json",
		regional_datapoints_csv: "./output/stadester_visualisations/6.results/regional_datapoints.csv",
		regional_urbanisation: "./output/stadester_visualisations/6.results/regional_urbanisation.json",
		regional_urbanisation_csv: "./output/stadester_visualisations/6.results/regional_urbanisation.csv",
		
		//7. Appendix
		appendix_folder: "./output/stadester_visualisations/7.appendix/",
		largest_120_csv_suffix: "_largest_120.csv",
  },
  
  ghsl_domain: [1975, 2025],
  stadester_base_domain: [-3000, 1975],
  stadester_y_offset: -2, //The Stadestér Y offset needed to realign itself with HYDE

  prefix: "Stadestér",
  startup_message: "Stadestér. Type 'help' for help."
}

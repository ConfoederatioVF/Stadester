//Initialise functions
{
	global.getStadesterRegionalUrbanObject = function () {
		//Declare local instance variables
		let common_defines = config.defines.common;
		let regional_urban_pop_obj = getStadesterRegionalUrbanPopulationObject();
		let regional_total_pop_obj = FileManager.loadFileAsJSON(common_defines.output_file_paths.region_population_totals);
		let region_defines = config.defines.regions;
		let return_array = [];
		let return_obj = {};
		
		//Iterate over all_region_keys; populate return_obj with all regions
		let all_region_keys = Object.keys(region_defines);
		
		for (let i = 0; i < all_region_keys.length; i++) {
			let local_region = region_defines[all_region_keys[i]];
			
			if (!local_region.is_clone)
				return_obj[local_region.key] = {};
		}
		
		//Iterate over all_regional_total_keys, compute urban share for year
		let all_regional_total_keys = Object.keys(regional_total_pop_obj);
		
		for (let i = 0; i < all_regional_total_keys.length; i++) {
			//Declare local instance variables
			let local_region = regional_total_pop_obj[all_regional_total_keys[i]];
			
			//Iterate over all_local_years in local_region
			let all_local_years = Object.keys(local_region);
			
			for (let x = 0; x < all_local_years.length; x++) {
				let local_urban_total = returnSafeNumber(regional_urban_pop_obj[all_regional_total_keys[i]][all_local_years[x]]);
				let local_total = local_region[all_local_years[x]];
				
				return_obj[all_regional_total_keys[i]][all_local_years[x]] = {
					rural_population: local_total - local_urban_total,
					total_population: local_total,
					urban_population: local_urban_total,
					
					rural_share: (local_total - local_urban_total)/local_total,
					urban_share: local_urban_total/local_total
				};
			}
		}
		
		//Iterate over all_return_keys; populate return_array
		let all_return_keys = Object.keys(return_obj);
		
		for (let i = 0; i < all_return_keys.length; i++) {
			let local_region = return_obj[all_return_keys[i]];
			
			//Iterate over all_local_years in local_region
			let all_local_years = Object.keys(local_region);
			
			for (let x = 0; x < all_local_years.length; x++) {
				let local_obj = local_region[all_local_years[x]];
				
				return_array.push({ region: all_return_keys[i], year: all_local_years[x], ...local_obj });
			}
		}
		
		//Save CSV, JSON path
		FileManager.saveFileAsCSV(common_defines.output_file_paths.regional_urbanisation_csv, return_array);
		FileManager.saveFileAsJSON(common_defines.output_file_paths.regional_urbanisation, return_obj);
		
		//Return statement
		return return_obj;
	};
	
	global.getStadesterRegionalUrbanPopulationObject = function () {
		//Declare local instance variables
		let common_defines = config.defines.common;
		let region_defines = config.defines.regions;
		
		let raster_paths = {};
		let return_obj = {};
		let stadester_urban_folder = common_defines.output_file_paths.stadester_urban_rasters_folder;
		let voronoi_raster = loadImage(common_defines.input_file_paths.voronoi_regions_file_path);
		
		fs.readdirSync(stadester_urban_folder).filter((file) => {
			let file_path = path.join(stadester_urban_folder, file);
			
			if (fs.statSync(file_path).isFile() && path.extname(file).toLowerCase() === ".png") {
				let file_year = file.replace(".png", "")
				.replace(common_defines.output_file_paths.stadester_urban_rasters_prefix, "");
				
				raster_paths[file_year] = file_path;
			}
		});
		
		raster_paths = sortObject(raster_paths, { mode: "ascending" });
		
		//Populate return_obj with regions
		let all_region_keys = Object.keys(region_defines);
		
		for (let i = 0; i < all_region_keys.length; i++) {
			let local_region = region_defines[all_region_keys[i]];
			
			if (!local_region.is_clone)
				return_obj[local_region.key] = {};
		}
		
		//Iterate over all_raster_keys
		let all_raster_keys = Object.keys(raster_paths);
		
		for (let i = 0; i < all_raster_keys.length; i++) {
			let local_file_path = raster_paths[all_raster_keys[i]];
			
			console.log(`- Summing: ${local_file_path} ..`);
			operateNumberRasterImage({
				file_path: local_file_path,
				function: function (arg0_index, arg1_number) {
					//Convert from parameters
					let index = arg0_index;
					let number = arg1_number;
					
					//Declare local instance variables
					let local_region = region_defines[[
						voronoi_raster.data[index],
						voronoi_raster.data[index + 1],
						voronoi_raster.data[index + 2]
					].join(",")];
					
					if (local_region)
						modifyValue(return_obj[local_region.key], all_raster_keys[i], number);
				}
			});
		}
		
		//Return statement
		return return_obj;
	};
	
	global.getStadesterRegionalTotalPopulationObject = function () {
		//Declare local instance variables
		let common_defines = config.defines.common;
		let region_defines = config.defines.regions;
		
		let raster_paths = {};
		let return_obj = {};
		let stadester_pop_folder = common_defines.output_file_paths.stadester_population_rasters_folder;
		let voronoi_raster = loadImage(common_defines.input_file_paths.voronoi_regions_file_path);
		
		fs.readdirSync(stadester_pop_folder).filter((file) => {
			let file_path = path.join(stadester_pop_folder, file);
			
			if (fs.statSync(file_path).isFile() && path.extname(file).toLowerCase() === ".png") {
				let file_year = file.replace(".png", "")
					.replace(common_defines.output_file_paths.stadester_population_rasters_prefix, "");
				
				raster_paths[file_year] = file_path;
			}
		});
		
		raster_paths = sortObject(raster_paths, { mode: "ascending" });
		console.log(`Raster paths:`, Object.values(raster_paths));
		
		//Populate return_obj with regions
		let all_region_keys = Object.keys(region_defines);
		
		for (let i = 0; i < all_region_keys.length; i++) {
			let local_region = region_defines[all_region_keys[i]];
			
			if (!local_region.is_clone)
				return_obj[local_region.key] = {};
		}
		
		//Iterate over all_raster_keys
		let all_raster_keys = Object.keys(raster_paths);
		
		for (let i = 0; i < all_raster_keys.length; i++) {
			let local_file_path = raster_paths[all_raster_keys[i]];
			
			console.log(`- Summing: ${local_file_path} ..`);
			operateNumberRasterImage({
				file_path: local_file_path,
				function: function (arg0_index, arg1_number) {
					//Convert from parameters
					let index = arg0_index;
					let number = arg1_number;
					
					//Declare local instance variables
					let local_region = region_defines[[
						voronoi_raster.data[index],
						voronoi_raster.data[index + 1],
						voronoi_raster.data[index + 2]
					].join(",")];
					
					if (local_region)
						modifyValue(return_obj[local_region.key], all_raster_keys[i], number);
				}
			});
		}
		
		FileManager.saveFileAsJSON(common_defines.output_file_paths.region_population_totals, return_obj);
		
		//Return statement
		return return_obj;
	};
}
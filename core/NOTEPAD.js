/*
//NOTEPAD.js file for future planning

global.getStadesterRegionalTotalPopulationObject = function () { //[WIP] - Rework to use finished rasters
		//Declare local instance variables
		let common_defines = config.defines.common;
		let region_defines = config.defines.regions;
		
		let ghs_pop_folder = common_defines.input_file_paths.ghsl_population_folder;
		let ghs_start_year = config.ghsl.processing.years[0];
		let raster_paths = {};
		let return_obj = {};
		let substrata_pop_folder = common_defines.input_file_paths.substrata_folder;
		let voronoi_raster = loadImage(common_defines.input_file_paths.voronoi_regions_file_path);
		
		fs.readdirSync(ghs_pop_folder).filter((file) => {
			let file_path =  path.join(ghs_pop_folder, file);
			
			if (fs.statSync(file_path).isFile() && path.extname(file).toLowerCase() === ".png") {
				let file_year = file.replace(".png", "")
					.replace(common_defines.input_file_paths.ghsl_population_prefix, "");
				
				raster_paths[file_year] = file_path;
			}
		});
		
		fs.readdirSync(substrata_pop_folder).filter((file) => {
			let file_path = path.join(substrata_pop_folder, file);
			
			if (fs.statSync(file_path).isFile() && path.extname(file).toLowerCase() === ".png") {
				let file_year = file.replace(".png", "")
					.replace(common_defines.input_file_paths.substrata_prefix, "")
					.replace("AD_number", "")
					.replace("BC_number", "");
				if (file.includes("BC"))
					file_year = `-${file_year}`;
				
				if (file_year < ghs_start_year)
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
		
		FileManager.saveFileAsJSON(common_defines.output_file_paths.region_population_totals, return_obj);
		
		//Return statement
		return return_obj;
	};
*/
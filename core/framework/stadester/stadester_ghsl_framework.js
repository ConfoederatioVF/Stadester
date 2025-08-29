//Initialise functions
{
	global.getStadesterGHSLObject = function () {
		//Declare local instance variables
		let common_defines = config.defines.common;
		let ghsl_obj = FileManager.loadFileAsJSON(common_defines.output_file_paths.ghsl_output);
		let regions_obj = config.defines.regions;
		let regions_raster = loadImage(common_defines.input_file_paths.voronoi_regions_file_path);
		let stadester_obj = FileManager.loadFileAsJSON(common_defines.input_file_paths.stadester_output);
		let return_obj = {};
		
		//Iterate over all_ghsl_cities in ghsl_obj; append all GHSL objects
		let all_ghsl_cities = Object.keys(ghsl_obj);
		
		for (let i = 0; i < all_ghsl_cities.length; i++)
			return_obj[`ghsl-${all_ghsl_cities[i]}`] = ghsl_obj[all_ghsl_cities[i]];
		
		//Iterate over all_stadester_cities in stadester_obj, prune any entries after 1975 from .area, .population, .density
		let all_stadester_cities = Object.keys(stadester_obj);
		
		for (let i = 0; i < all_stadester_cities.length; i++) {
			let local_city = stadester_obj[all_stadester_cities[i]];
			let keys_to_truncate = ["area", "density", "population"];
			
			if (!local_city.coords) continue; //Internal guard clause if city has no coords
			
			for (let x = 0; x < keys_to_truncate.length; x++)
				if (local_city[keys_to_truncate[x]]) {
					let all_local_keys = Object.keys(local_city[keys_to_truncate[x]]);
					
					//Iterate over all_local_keys and delete any values after 1975
					for (let y = 0; y < all_local_keys.length; y++)
						if (parseInt(all_local_keys[y]) >= common_defines.ghsl_domain[0])
							delete local_city[keys_to_truncate[x]][all_local_keys[y]];
				}
			
			return_obj[`stadester-${all_stadester_cities[i]}`] = local_city;
		}
		
		//Iterate over all_return_keys; assign .region
		let all_return_keys = Object.keys(return_obj);
		
		for (let i = 0; i < all_return_keys.length; i++) {
			let local_city = return_obj[all_return_keys[i]];
			
			if (!local_city.coords) continue; //Internal guard clause if .coords does not exist
			local_city.pixel_coords = getEquirectangularCoordsPixel(local_city.coords[0], local_city.coords[1]);
			local_city.pixel_coords = local_city.pixel_coords.map(Math.round);
			
			let local_index = (2160 - local_city.pixel_coords[1])*4*4320 + local_city.pixel_coords[0]*4;
			let local_region = regions_obj[[
				regions_raster.data[local_index],
				regions_raster.data[local_index + 1],
				regions_raster.data[local_index + 2]
			].join(",")];
			
			if (local_region) {
				local_city.colour = local_region.colour;
				local_city.region = local_region.key;
			}
		}
		
		//Save file to JSON
		FileManager.saveFileAsJSON(common_defines.output_file_paths.stadester_ghsl, return_obj);
		
		//Return statement
		return return_obj;
	};
}
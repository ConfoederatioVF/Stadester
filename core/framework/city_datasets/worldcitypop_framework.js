//Initialise functions
{
	global.getWorldcitypopObject = function () {
		//Return statement
		return JSON.parse(fs.readFileSync(config.defines.common.input_file_paths.worldcitypop_cities, "utf8"));
	};
}
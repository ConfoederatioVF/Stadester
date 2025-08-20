//Initialise functions
{
  global.initialiseOptimisation = function () {
    //Declare local instance variables
    let region_defines = config.defines.regions;
    
    //Iterate over all_region_defines
    let all_region_defines = Object.keys(region_defines);
    
    for (let i = 0; i < all_region_defines.length; i++) {
      let local_region = region_defines[all_region_defines[i]];
      
      //Set .key metadata; add colour copy for brevity
      local_region.key = all_region_defines[i];
      if (local_region.colour) {
        region_defines[local_region.colour.join(",")] = JSON.parse(JSON.stringify(local_region));
        let clone_region = region_defines[local_region.colour.join(",")];
        
        clone_region.is_clone = true;
      }
    }
  };
  
  global.startup = function () {
    //Initialise main with cities
    global.main = {};
      global.main.browser_instances = {};
      global.main.cities = {}; //Contains final Stadestér data
      global.main.curl = {
        populstat: {}
      };
      global.main.population = {}; //Contains city population data
    
    //Load .csv datasets
    loadChandlerModelskiCSVs();

    //Load Populstat; Wikipedia
    try {
      global.main.curl.populstat = loadPopulstatData();
    } catch (e) {
      console.error(e);
    }

    //Apply manual fixes to population datasets
    fixChandlerModelskiPopulations();
    processPopulstatData();

    //[WIP] - Debugging
    printErroneousChandlerModelskiPopulations();
    
    //Initialise optimisation
    initialiseOptimisation();
  };
} 
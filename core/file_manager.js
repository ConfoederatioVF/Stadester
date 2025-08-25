module.exports = {
  getAllFiles: function (arg0_folder) {
    //Convert from parameters
    var folder = arg0_folder;

    //Declare local instance variables
    var file_array = [];

    try {
      var files = fs.readdirSync(folder);

      for (var i = 0; i < files.length; i++) {
        //Self-reference to fetch files in sub-directories
        local_dir_array = (fs.statSync(folder + "/" + files[i]).isDirectory()) ? module.exports.getAllFiles(folder + "/" + files[i]) : file_array.push(path.join(folder, "/", files[i]));

        //Add files from local_dir_array to file_array
        for (var x = 0; x < local_dir_array.length; x++) file_array.push(local_dir_array[x]);
      }
    } catch (e) {
      console.log(e);
    }

    //Return statement
    return file_array;
  },

  loadAllScripts: function () {
    //Declare local instance variables
    var loaded_files = [];

    //Load config backend files individually first
    var local_load_order = load_order.load_files;

    for (var i = 0; i < local_load_order.length; i++) {
      for (var x = 0; x < load_order.load_directories.length; x++) {
        var local_dir = load_order.load_directories[x];
        var all_directory_files = module.exports.getAllFiles(local_dir);

        for (var y = 0; y < all_directory_files.length; y++)
          if (all_directory_files[y].includes(local_load_order[i]))
            if (all_directory_files[y].endsWith(".js")) {
              module.exports.loadFile(all_directory_files[y]);
              loaded_files.push(local_load_order[i]);
              console.log(`Loaded imperative file ${all_directory_files[y]}.`);
            }
      }
    }

    //Load each load directory separately
    for (var i = 0; i < load_order.load_directories.length; i++) {
      var local_dir = load_order.load_directories[i];
      var all_directory_files = module.exports.getAllFiles(local_dir);

      for (var x = 0; x < all_directory_files.length; x++)
        if (!loaded_files.includes(all_directory_files[x]))
          if (all_directory_files[x].endsWith(".js")) {
            module.exports.loadFile(all_directory_files[x]);
            loaded_files.push(all_directory_files[x]);
          }
    }

    console.log(`Loaded ${loaded_files.length} files from ${load_order.load_directories.length} directories.`);
  },

  load: function (arg0_file_path) {
    //Convert from parameters
    var file_path = (arg0_file_path) ? arg0_file_path : "./database.json";

    //Declare main
    main = JSON.parse(fs.readFileSync(file_path, "utf8"));

    console.log(`Loaded main DB from ${file_path}`);
  },
  
  loadCSVAsJSON: function (arg0_file_path, arg1_options) { //[WIP] - Refactor at a later date
    var file_path = arg0_file_path;
    var options = arg1_options ? arg1_options : {};
    if (!options.mode) options.mode = "vertical";
    
    var csv_string = fs.readFileSync(file_path, "utf8");
    var csv_array = csv_string.trim().split(/\r?\n/);
    var parsed_rows = csv_array.map(parseCSVLine);
    var return_obj = {};
    
    if (options.mode == "vertical") {
      var headers = parsed_rows[0];
      for (let i = 1; i < parsed_rows.length; i++) {
        var row = parsed_rows[i];
        var key = row[0];
        if (!key) continue;
        if (!return_obj[key]) {
          return_obj[key] = {};
          for (let j = 1; j < headers.length; j++) {
            return_obj[key][headers[j]] = [];
          }
        }
        for (let j = 1; j < headers.length; j++) {
          return_obj[key][headers[j]].push(row[j] !== undefined ? row[j] : null);
        }
      }
    } else if (options.mode == "horizontal") {
      // In horizontal mode, each column after the first is a key
      var property_names = parsed_rows[0];
      for (let col = 1; col < property_names.length; col++) {
        var key = property_names[col];
        if (!key) continue;
        if (!return_obj[key]) {
          return_obj[key] = {};
          // Initialize arrays for each row label (excluding the first row)
          for (let row = 1; row < parsed_rows.length; row++) {
            var row_label = parsed_rows[row][0];
            return_obj[key][row_label] = [];
          }
        }
        for (let row = 1; row < parsed_rows.length; row++) {
          var row_label = parsed_rows[row][0];
          var value = parsed_rows[row][col] !== undefined ? parsed_rows[row][col] : null;
          return_obj[key][row_label].push(value);
        }
      }
    }
    
    function parseCSVLine(line) {
      var current = "";
      var in_quotes = false;
      var result = [];
      for (let i = 0; i < line.length; i++) {
        if (line[i] == '"' && (i == 0 || line[i - 1] != "\\")) {
          in_quotes = !in_quotes;
        } else if (line[i] == "," && !in_quotes) {
          result.push(current.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
          current = "";
        } else {
          current += line[i];
        }
      }
      result.push(current.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
      return result;
    }
    
    return return_obj;
  },

  loadFile: function (arg0_file) {
    //Declare local instance variables
    var file_path = path.join(__dirname, "..", arg0_file);

    //Evaluate file contents
    try {
      var rawdata = fs.readFileSync(file_path);
      eval(rawdata.toString());
    } catch (e) {
      console.error(`Failed to load ${file_path}.`);
      console.error(e);
    }
  },

  loadFileAsJSON: function (arg0_file_path) {
    //Convert from parameters
    var file_path = arg0_file_path;

    //Return statement
    return JSON.parse(fs.readFileSync(file_path, "utf8"));
  },

  save: function (arg0_file_path) {
    //Convert from parameters
    var file_path = (arg0_file_path) ? arg0_file_path : "./database.json";

    fs.writeFileSync("./database.json", JSON.stringify(main, null, 2));
    console.log(`Saved main DB to ${file_path}`);
  },
	
	saveFileAsCSV: function (arg0_file_path, arg1_object_array) {
		//Convert from parameters
		let file_path = arg0_file_path;
		let object_array = arg1_object_array;
		
		//Declare local instance variables
		let json2csv_parser = new json2csv.Parser();
		let new_csv = json2csv_parser.parse(object_array);
		
		fs.writeFileSync(file_path, new_csv);
		console.log(`Saved CSV to ${file_path}`);
	},

  saveFileAsJSON: function (arg0_file_path, arg1_data) {
    //Convert from parameters
    var file_path = arg0_file_path;
    var data = arg1_data;
    
    fs.writeFileSync(file_path, JSON.stringify(data, null, 2));
    console.log(`Saved JSON to ${file_path}`);
  }
};

//Initialise functions
{
  global.loadCSVAsArray = function (arg0_input_file_path, arg1_options) {
    //Convert from parameters
    var input_file_path = arg0_input_file_path;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var csv_file = fs.readFileSync(input_file_path, (options.utf) ? options.utf : "utf8");
    var result = papaparse.parse(csv_file, {
      delimiter: options.delimiter,
      skipEmptyLines: true
    });

    //Return statement
    return result.data;
  };
}
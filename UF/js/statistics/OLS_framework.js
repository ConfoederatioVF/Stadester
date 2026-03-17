//Initialise functions
{
  global.computeVIF = function (arg0_X) {
    //Convert from parameters
    let X = arg0_X;

    //Declare local instance variables
    let XT_X = mathjs.multiply(mathjs.transpose(X), X);
    let XT_X_inv = mathjs.inv(XT_X);
    let vif = XT_X_inv.map((row, i) => row[i]);

    //Return statement
    return vif;
  };

  global.conditionNumber = function (arg0_X, arg1_epsilon) {
    //Convert from parameters
    let X = arg0_X;
    let epsilon = returnSafeNumber(arg1_epsilon, 1e-12);

    //Declare local instance variables
    try {
      X = X._data;
    } catch (e) {}
    
    let matrix = new ml_matrix.SVD(X, { autoTranspose: true });
    let singular_values = matrix.diagonal;

    //Find max and min singular values
    let max_s = Math.max(...singular_values);
    let min_s = Math.max(Math.min(...singular_values), epsilon); //Ensure min_s is never 0

    //Return statement
    return max_s/min_s;
  };

  global.removeHighVIFFeatures = function (arg0_X, arg1_threshold) {
    //Convert from parameters
    let X = arg0_X;
    let threshold = returnSafeNumber(arg1_threshold, 10);

    //Declare local instance variables
    let vif_scores = computeVIF(X);
    console.log(`- Computed VIF scores.`);
    let to_keep = vif_scores.map((vif, i) => (vif < threshold));
    console.log(`- Found VIF scores to keep.`);

    //Return statement
    return X.map((row) => row.filter((_, index) => to_keep[index]));
  };

  global.ridgeRegression = function (arg0_X, arg1_Y, arg2_lambda) {
    //Convert from parameters
    let X = arg0_X;
    let Y = arg1_Y;
    let lambda = returnSafeNumber(arg2_lambda, 1e-3);

    //Declare local instance variables
    let XT = mathjs.transpose(X);
    let XT_X = mathjs.multiply(XT, X);
    let identity = mathjs.identity(XT_X.size()[0]);
    
    let XT_X_reg = mathjs.add(XT_X, mathjs.multiply(identity, lambda)); //Ridge term
    let XT_Y = mathjs.multiply(XT, Y);

    //Return statement; return beta
    return mathjs.multiply(mathjs.inv(XT_X_reg), XT_Y);
  };
}
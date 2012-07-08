exports.update = function(sql, values, response, callback)
{
  console.log("UPDATE: " + sql);
  var pg = require('pg');
  var conString = "tcp://postgres:2b4bfcb57739@127.0.0.1:6543/template1";

  pg.connect(conString, function(err, client)
  {
		if (err !== null) {
      console.log("CONN ERROR: " + err);
			console.log(new Error().stack);
			callback = null;
			return;
		}
	 
    console.log("UPDATE connected");
    client.query(sql, values, function(err) {
 			if (err !== null) {
				console.log("QUERY ERROR: " + err);
			  console.log(new Error().stack);
			  callback = null;
			}
      
		  if (callback !== undefined && callback !== null) {
        console.log("UPDATE callback");
        callback(response);
      } 
		  
      console.log("UPDATE finished");
        response.end();
    });
  });
} 


exports.select = function(sql, response, values_callback, no_values_callback)
{
  // TODO: move connection string into a file
  console.log("SELECT: " + sql);

  var pg = require('pg').native;
  var conString = "<insert connection string here>";

  pg.connect(conString, function(err, client)
  {
		if (err !== null) {
      console.log("CONN ERROR: " + err);
			console.log(new Error().stack);
		  
			no_values_callback = null;
		  values_callback = null;
			return;
		}
    
	  client.query(sql, function(err, result) {
		  if (err !== null) {
        console.log("QUERY ERROR: " + err);
			  console.log(new Error().stack);
		    values_callback = null;
			}
     
      if (result === undefined || result.rows.length == 0)
      { 
        console.log("No values");
        no_values_callback(response);
      }
      else
      {
        console.log("Found values");
        values_callback(response, result.rows);
      }
		  no_values_callback = null;
		  values_callback = null;
    });
  });
};


exports.write_int = function(response, data)
{
	console.log("write_int: " + JSON.stringify(data));
  var row = data[0];

  for (property in row)
  {
		var value = row[property].toString();
		console.log("write_int found: " + property + "=" + value);
		if (value !== undefined)
		{
			console.log("writing " + value);
      response.write(value);
      response.end();

			return;
		}
  }

	console.log("ERROR: no value found")
	console.log(new Error().stack);
	response.write("ERROR: no value found")
  response.end();
};


exports.select_response = function(sql, response)
{
  console.log('SELECT_RESPONSE: ' + sql);

  var pg = require('pg').native;
  var conString = "<insert connection string here>";
 
  pg.connect(conString, function(err, client) {
		if (err !== null) {
      console.log("CONN ERROR: " + err);
		  console.log(new Error().stack);
			return;
		}

    client.query(sql, function(err, result) {
      if (err !== null) {
        console.log("QUERY ERROR: " + err);
		    console.log(new Error().stack);
      } 
		  response.write("[");
      var firstRow = true;

      for (var i = 0; i < result.rows.length; i++) {
        var row = result.rows[i];
        if (!firstRow) {
          response.write(", ");
        } 
        firstRow = false;
        response.write("{");
  
        var firstColumn = true; 
        for (property in row) {
          if (!firstColumn) {
            response.write(", ");
          } 
          
          response.write("\"" + property + "\" : \"" + row[property] + "\"");
          firstColumn = false;
        }
        response.write("}");
      }

			result = null;
    
      response.write("]");
      response.end();
    });
  });
}


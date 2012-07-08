exports.update = function(sql, values, response, callback)
{
  var file = require('./config').file;

	var fs = require('fs');
  var stream = fs.createWriteStream(file);
  stream.once('open', function(fd) {
    stream.write(values);
  });

	if (callback !== undefined && callback !== null) {
    console.log("UPDATE callback");
    callback(response);
  } 
		  
  console.log("UPDATE finished");
  response.end();
} 

exports.select = function(sql, response, values_callback, no_values_callback)
{
  values_callback(response, result.rows);
};


exports.write_int = function(response, data)
{
	var file = require('./config').file;

	var fs = require('fs');
  var stream = fs.createWriteStream(file);
  stream.once('open', function(fd) {
    stream.write(data);
  });
};


exports.select_response = function(sql, response)
{
  response.end();
}


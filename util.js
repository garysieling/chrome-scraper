exports.update = function(sql, values, response, callback)
{
	require('./' + require('./config').method + '-output').update(sql, values, response, callback)
} 


exports.select = function(sql, response, values_callback, no_values_callback)
{
	require('./' + require('./config').method + '-output').select(sql, response, values_callback, no_values_callback);
};

exports.write_int = function(response, data)
{
	require('./' + require('./config').method + '-output').write_int(response, data);
};


exports.select_response = function(sql, response)
{
	require('./' + require('./config').method + '-output').select_response(sql, response);
}


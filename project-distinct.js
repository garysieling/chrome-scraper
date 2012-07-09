exports.get_parser = function (document, server)
{
  var values = document.getElementsByClassName('status-text');
  var valueText = '';
	for (var i = 0; i < values.length; i++)
	{
		valueText += values[i].innerText + ",";	
	}

  if (values.length > 0)
	{
	  valueText = valueText.substring(0, valueText.length - 1);
	}

 	var url = document.location.href;
  if (url.indexOf("/") >= 0) {
     url = url.substring(url.lastIndexOf("/") + 1);
  }

	valueText = url + "," + valueText;
  valueText.replace(/^\s*/, '').replace(/\s*$/, '');


  server('set_data', valueText);
};

exports.set_data = function(request, response, data)
         {
  console.log('setting data ' + data);
  var values = require('./util').read_values('status');

  if (values.indexOf(data) === -1)
  {	
	require('./util').write_value('status', '', data);
  }
  response.end();
}

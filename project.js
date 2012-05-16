exports.get_parser = function (document, db)
{
  var url = document.location.href;
  if (url.indexOf("/") >= 0) {
     url = url.substring(url.lastIndexOf("/") + 1);
  }

  console.log('retrieving site');
  var text = document.body.innerHTML.toLowerCase();
  var site_id = db('get_site', url);
	if (site_id === undefined)
		return;

  console.log('got site');

  function check_strings (text, site_id, results, key, value, save)
  { 
    console.log(text + ", " + site_id + ", " + results + ", " + key + ", " + value + ", " +save)
    var found = false;
    for (var i = 0, max = results.length; i < max; i++)
    {
      var row = results[i];
      var data = row[value];
      var id = row[key];
      var regex = new RegExp("\\W" + data + "\\W", "i");
      if (text.match(regex))
      {
        console.log("save " + save + " " + site_id + " " + id);
        db(save, site_id, id);
        found = true;
      }
    }

    if (!found)
    {
      db(save, site_id, -1);
    }
  }; 
  check_strings(text, site_id, db('get_advertisers'), 'advertiser_id', 'advertiser_string', 'save_advertiser');

  var xpathReplaceNS = new RegExp("/x:", "g");
  var currencyRegex = new RegExp(",", "g");

  console.log("saving");
  var save_xpaths = function(data)
  {
		return;
    console.log("save_xpaths");
    var results = {}; 
    var table = data.table;
    var xpaths = data.xpaths;

    results.site_id = site_id;

    for (var i = 0; i < xpaths.length; i++)
    {
      var row = xpaths[i]; 
      var column = row.column;
      var xpath = row.xpath;
      var data = '';

      if (xpath !== '')
      {
         xpath = xpath.replace(xpathReplaceNS, "/");
         console.log('evaluating xpath ' + xpath);
         try 
         {
	 				 xpathRes = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
           data = xpathRes.iterateNext().innerText;

	         if (row.type === '$')
           {
              // parse as U.S. currency
              if (data.charAt(0) === '$')
              {
                data = data.substring(1, data.length);
              }

              data = data.replace(currencyRegex, ""); 
           }
         }
         catch (e)
         {
           console.log(e.toString());
         }
         console.log('xpath value ' + column + ' = ' + data);
         results[column] = data; 
      }
    }

    var result_data = JSON.stringify(results);
		console.log("DATA: " + result_data);
    db('set_data', table, result_data);
  };

  save_xpaths({
    "table": "auctions",
    "xpaths" : [
      {"column": "sample_field1", "type": "$", "xpath": "id('content')/div[2]/div[3]/div[1]/h2[2]"},
      {"column": "sample_field2", "xpath": "id('content')/x:div[2]/x:div[1]/x:h2/x:a"},
      {"column": "sample_field3", "xpath": "id('content')/x:div[2]/x:div[3]/x:div[1]/x:dl/x:dd[1]/x:span"},
      {"column": "sample_field4", "xpath": "id('content')/x:div[2]/x:div[3]/x:div[1]/x:dl/x:dd[2]/x:span"},
    ]
  });
};

exports.get_site = function(request, response, site_key)
{
  var util = require('./util');
  var select_sql = "SELECT site_id FROM sites WHERE site_key = '" + site_key + "'";
  util.select(select_sql, response, require('./util').write_int, 
    function() {
      console.log ("Inserting new site");
      var insert_sql = 
              "INSERT INTO sites (site_id, site_key) " +
              "VALUES (nextval('site_id'), '" + site_key + "')";

      site_key = null;
      util.update(insert_sql, response, 
	function() {
          console.log("Finding newly created site");
          util.select(select_sql, response, require('./util').write_int)
        });
    });
};

exports.save_advertiser = function(request, response, site_id, advertiser_id)
{
  if (site_id === undefined)
	{
		console.log("ERROR: site_id not defined");
		console.log(new Error().stack);
		response.write("ERROR: site_id not defined");
		response.end();
		return;
	}

  var sql = "INSERT INTO sites_advertisers (row_id, site_id, advertiser_id) " +
            "VALUES (nextval('row_id_seq'), " + site_id + ", " + advertiser_id + ")";
  require('./util').update(sql, response);
};

exports.save_social_media = function(request, response, site_id, social_media_id)
{
  var sql = "INSERT INTO sites_social_media (row_id, site_id, social_media_id) " +
            "VALUES (nextval('row_id_seq'), " + site_id + ", " + social_media_id + ")";
  require('./util').update(sql, response);
};

exports.get_advertisers = function(request, response)
{
  var sql = "SELECT advertiser_string, advertiser_id FROM possible_advertiser_names";
  require('./util').select_response(sql, response);
};

exports.set_data = function(request, response, table, data)
{
  console.log('setting data in ' + table + ", " + data);
  var row = JSON.parse(data);
	data = null;
  var columns = '';
  var row_data = '';
  var first = true; 

  var data = false;
  console.log('Building sql');
  var badDataRe = new RegExp("[\n\t\"']", "g");
  for (var property in row)
  {
    data = true;
    columns += ", ";
    
    columns += property;
    var safe_data = row[property];
    console.log("safe_data: " + safe_data);
    if (safe_data === null || safe_data === undefined)
    {
      safe_data = '';
    }

    safe_data = safe_data.toString();
    safe_data = safe_data.replace(badDataRe, " ");
    
    safe_data = escape(safe_data);

    row_data += ',\'' + safe_data + '\'';
  }

  row = null;

  // TODO: this may not be right, may want to track even if no data 
  if (data)
  {  
    var sql = "INSERT INTO " + table + " (row_id" + columns + ") " +
              "VALUES (nextval('row_id_seq')" + row_data + ")";
		row_data = null;
    console.log("INSERT set_data " + sql);
    require('./util').update(sql, response);
  }
};

exports.get_social_media = function(request, response)
{
  var sql = "SELECT key, social_media_id FROM social_media_identify";
  require('./util').select_response(sql, response);
};

// ==UserScript==
// @name DB Scraper
// @descriptions Integration with DB Scraper
// @version 1
// @match file://*
// ==/UserScript==

function closeWindow()
{
  window.open('', '_self', '');
  window.close();
}

function parseData()
{
	try {
  GM_xmlhttpRequest({
    method: "POST",
    url: "http://localhost:8080/index.js?mode=parser",
    onload: function(response) {
			check_error(response);
      parser = new Function(response.responseText);
	    (parser())(document, get_data);

      closeWindow();				
    },
	  onerror: function(response) {
		  retry();
		}
  }, true);
  }	
	catch (e)
	{
		//throw e;
		retry();
	}
}

var timeout = 1000;
var maxTimeout = 10000;
var timeoutCount = 0;
var errorRegex = new RegExp("^ERROR: ");

function check_error(response)
{
	var data = "";
  if (response.responseText !== "")
	{
	  if (!errorRegex.test(response.responseText))
		{
			return response.responseText;
	  }
	  else
		{
			retry(response);
	  }
  }
	else
	{
	  data = "";
	}

	return data;
}

function retry(response)
{
  if (timeoutCount < 1000)
	{
	  window.setTimeout(parseData, Math.floor(Math.random()*timeout));
    timeout *= 2;
		if (timeout > maxTimeout)
		{
				timeout = 100;
		}
		timeoutCount++;

		if (response && 
				response.responseText !== '' && 
				response.responseText !== undefined && 
				response.responseText !== null)
		{
		  throw response.responseText;
		}
		else
		{
			console.log("ERROR: server down");
		}
  }
	else
	{
	  closeWindow();
  }
}

var get_data = function(fn, args)
{
  var data;

	var query = "&l=" + (arguments.length - 1);
  // TODO: escape for query string
  for (var i = 1, max = arguments.length; i < max; i++)
	{
	  query += "&a" + (i - 1) + "=" + escape(arguments[i]);
  }

	var resp = null;
	GM_xmlhttpRequest({
    method: "POST",
    url: "http://localhost:8080/index.js?mode=data&fn=" + fn + query,
    onload: function(response) {
			resp = response;
    }
  }, false);

	if (resp.responseText !== '')
	{
    data = JSON.parse(check_error(resp));
	}
	return data;
};

parseData();

GM_xmlhttpRequest = function(obj, async) {
	var crossDomain = (obj.url.indexOf(location.hostname) == -1);
                       
  if ((typeof(obj.onload) != 'undefined') && (crossDomain)) {
  	obj.requestType = 'GM_xmlhttpRequest';
    if (typeof(obj.onload) != 'undefined') {
   		chrome.extension.sendRequest(obj, function(response) {
     		obj.onload(response);
      });
    }
  } else {
    var request=new XMLHttpRequest('', async);
    request.onreadystatechange=function() { 
			if(obj.onreadystatechange) { 
				obj.onreadystatechange(request); 
			}; 
			
			if(request.readyState==4 && obj.onload) { 
				obj.onload(request); 
			} 
		}

    request.onerror=function() { 
			if(obj.onerror) { 
				obj.onerror(request);
		 	} 
		}
    
		try { 
			request.open(obj.method,obj.url,async); 
		} catch(e) { 
			if(obj.onerror) { 
				obj.onerror( 
					{ readyState:4,responseHeaders:'',
					  responseText:'',
						responseXML:'',
						status:403,
						statusText:'Forbidden'} ); 
			}; 
			return; 
		}
    
		if(obj.headers) { for(name in obj.headers) { request.setRequestHeader(name,obj.headers[name]); } 
		}
    request.send(obj.data); return request;
  }
}



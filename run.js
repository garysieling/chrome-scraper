var console = {log: function(m){WSH.echo(m);}, 
				       write: function(m){WSH.StdOut.Write(m);}};

var workingDir = "<directory of this script>";
var startTime = Date()
console.log(startTime)

var showLength = false
var limit = -1
var noExec = false
var printOnly = false
var sleepTime = 200 
var verbose = false
var start = 0
var resume = false
var blankChrome = false
var excludeFile = ""

var args = WScript.Arguments;
for (var i = 0; i < args.length; i++) {
	if ("--length" === args(i)) 
		showLength = true

	if ("--limit" === args(i) || "-l" === args(i))
		limit = args(++i)

	if ("--no-exec" === args(i) || "-n" === args(i)) 
		noExec = true
	
	if ("--sleep" === args(i) || "-s" === args(i))
		sleepTime = args(++i)
	
	if ("--verbose" === args(i) || "-v" === args(i))
		verbose = true
	
  if ("--print-only" === args(i) || "-p" === args(i))
		printOnly = true
  
	if ("--resume" === args(i) || "-r" === args(i))
		resume = true
	
	if ("--chrome" === args(i) || "-c" === args(i))
		blankChrome = true
	
	if ("--exclude" === args(i) || "-e" === args(i))
		excludeFile = args(++i)
}

if (resume)
{
    var obj = WSH.CreateObject("Scripting.FileSystemObject")
		var file = obj.OpenTextFile(workingDir + "continue", 1)
		start = file.ReadLine()
		file.close()
}

var exclude = []
if (excludeFile !== "")
{
    var obj = WSH.CreateObject("Scripting.FileSystemObject")
		var path = workingDir + excludeFile
		var file = obj.OpenTextFile(path, 1)

		exclude = {}
    while( !file.AtEndOfStream )
		{
			var key = file.ReadLine()
		  exclude[key] = true
		}
		
		file.close()
}

var chrome="<insert path to Chrome executable>";
var path="<insert path to files>"
var directoryObj = new ActiveXObject("Scripting.FileSystemObject")
var directory = directoryObj.GetFolder(path)
var data="<temp folder name here>";
var chromeArgs = " --user-data-dir=$data --incognito --disable-sync-autofill-profile --disable-sync  --disable-java --disable-javascript --disable-local-storage --disable-preconnect  --disable-restore-background-contents --disable-restore-session-state --dns-prefetch-disable --disable-images --disable-metrics --disable-metrics-reporting --disable-login-animations";

var filematch="^[0-9]+-"
var fileRegex = new RegExp(filematch); 
var shell = new ActiveXObject("WScript.Shell");

if (showLength) {
  var files = new Enumerator(directory.Files);
  var count = 0;
  for (; !files.atEnd(); files.moveNext()) {
    var filename = files.item().name;
	  if (fileRegex.test(filename))
  		count++;
  }
	console.log("Found " + count + " files");
}

shell.run(chrome + chromeArgs);

if (noExec || blankChrome)
{
  WScript.Quit(0);
}

if (verbose)
{
  console.log("Sleeping for " + sleepTime)
  console.log("Stopping at " + limit)
}

if (start > 0)
	console.log("Starting at file " + start)
  
var files = new Enumerator(directory.Files);
var fileIndex = 0;
var checked = 0;
function loadChrome() {
	while(true)
	{
	  if (verbose)
  	  console.log("Testing " + filename);

    var filename;
    filename = files.item().name;
		
	  if (exclude[filename] && verbose)
		  console.log("Skipping " + filename)

  	while ((!fileRegex.test(filename)) && !files.atEnd())	{
      files.moveNext()
      filename = files.item().name;
  	}

    if (!fileRegex.test(filename)) // this means at end but no match
      return;

		checked++;

    if (checked <= start)
		{
		  files.moveNext()
			continue;
		}

		if (verbose || printOnly)
 	    console.log(filename)
		else
			console.write(".")

    var obj = WSH.CreateObject("Scripting.FileSystemObject")
		var file = obj.OpenTextFile(workingDir + "continue", 2)
		file.Write(checked)
		file.close()

    if (exclude[filename])
		{
		  files.moveNext()
			continue;
		}

	  if (!printOnly)
 	    shell.run(chrome + chromeArgs + " --user-data-dir=$data --incognito --disable-sync-autofill-profile --disable-sync file:///<insert path here>" + filename)

    fileIndex++;
    if (((checked - start) >= limit && limit > 0) || (files.atEnd()))
	  	return;

		if (!printOnly)
  	  WScript.Sleep(sleepTime)

		files.moveNext()

		if (fileIndex % 10 === 0)
		{
			var procs = getChromeProcesses()
			console.log("procs: " + procs)
	    if (procs > 50)
         WScript.Sleep(1000 * procs / 5 * procs / 10)
		}
		
		if (fileIndex % 500 === 0)
		{
      WScript.Sleep(15000)
		}
	}
}

function getChromeProcesses()
{
	var count = 0
  var e = new Enumerator( GetObject( "winmgmts:" ).InstancesOf( "Win32_process" ) );
  for (;!e.atEnd();e.moveNext())
    if (e.item().Name === "chrome.exe")
			count++
  
	if (verbose) 
	  console.log("getChromeProcesses: " + count) 
  return count;	
}

if (!files.atEnd())
	loadChrome();

var endTime = Date()
console.log("")
console.log("Start: " + startTime)
console.log("End: " + endTime)

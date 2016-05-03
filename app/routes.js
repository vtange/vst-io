var multer  = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage, dest: './tmp/'});

//VST host
var VSTHost = require("node-vst-host").host;
 
var host = new VSTHost();
 
// Print our a list of the available plugins 
host.listPlugins( function(names) {
	console.log( "Available Plugins");
	console.log( names );
});

//audio processor
var SoxCommand = require('sox-audio');
var addStandardListeners = function(command) {
	command.on('start', function(commandLine) {
		console.log('Spawned sox with command ' + commandLine);
	});

	command.on('progress', function(progress) {
	    console.log('Processing progress: ', progress);
	});

	command.on('error', function(err, stdout, stderr) {
	    console.log('Cannot process audio: ' + err.message);
	    console.log('Sox Command Stdout: ', stdout);
	    console.log('Sox Command Stderr: ', stderr)
	});

	command.on('end', function() {
	    console.log('Sox command succeeded!');
	});
};
var toWav = function(fileName, outputName) {
	var command = SoxCommand();
	command.input(fileName);
	command.output(outputName)
		.outputFileType('wav')

	addStandardListeners(command);
	command.run()
	return command;
};


var uploadFile = function(req, res) {
	console.log(req.files);
	var sampleFile = req.files.userfile;
	sampleFile.mv(__dirname + '/' + req.files.userfile.name, function(err) {
		if (err) {
			console.log(err);
			res.status(500).send(err);
		}
		else {
			toWav(__dirname + '/' +  req.files.userfile.name, req.files.userfile.name.slice(0,req.files.userfile.name.length-4)+'.wav');
		}
	});
};

// app/routes.js
module.exports = function(app) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index', {
            title : app.title, // get the title
            user : req.user // get the user out of session and pass to template
        }); // load the index.ejs file
    });

 	// =====================================
    // UPLOAD ========
    // =====================================
	app.post('/',upload.single('userfile'), uploadFile);	//.single('userfile') must match name of file in app.js -> formData.append("userfile",
};
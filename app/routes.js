var multer  = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage, dest: '/workspace/'});
var Promise = require('bluebird');

// Workspace directory PATH (string)
var appRoot = require('app-root-path');
var workspace_dir = __dirname + '/workspace/';
var vst_dir = appRoot + "/";

// VST host
var VSTHost = require('node-vst-host').host;
var host = new VSTHost();

// Print list of the available plugins 
host.listPlugins( function(names) {
	console.log( 'Available Plugins' );
	console.log( names );
});

// Audio processor
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
	    console.log('Sox Command Stderr: ', stderr);
	});

	command.on('end', function() {
	    console.log('Sox command succeeded!');
	});
};
function toWav(fileName, outputName) {
	return new Promise(function(resolve, reject) {
		var command = SoxCommand();
		command.input(fileName);
		command.output(outputName)
			.outputFileType('wav');

		addStandardListeners(command);
		command.run(reject, resolve);
	});
};
function deEss(fileName, outputName) {
	return new Promise(function(resolve, reject) {
		host.processAudio( fileName, outputName, [{name:vst_dir+"test_VST.dll", preset:vst_dir+"test_VST.fxp"}], resolve, reject);
	});
};

function VSTprocess(fn, fileName, outputName){
	fn(fileName, outputName)
		.then(function(){
			//finished VST
			console.log("VST processed :D");
		})
		.catch(function(){
			//broke VST
			console.log("something went wrong in VSTmode");
		});
}

var uploadFile = function(req, res) {
	var file = req.files.audiofiles;
	console.log(file);
	console.log(req.files);
	/*
	file.mv(workspace_dir + file.name, function(err) {
		if (err) {
			console.log(err);
			res.status(500).send(err);
		}
		else {
			//determine what process from req.body
			var vst = deEss;

			//process
			var fileName = file.name;
			var outputName = fileName.slice(0,fileName.length-4);
			//default processing (conv to WAV, process, output WAV)
			toWav( workspace_dir + fileName, workspace_dir + outputName+'.wav' )
			.then(function(){
				//goodCB -> process with VST
				VSTprocess(vst, workspace_dir + outputName+'.wav',  workspace_dir + '[tweak]'+outputName+'.wav');

			})
			.catch(function(){
				//errCB -> "woops, couldn't process your file"
				console.log("something went wrong in conversion mode");
			});
		}
	});*/
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
	var package = upload.fields([{ name: 'audiofiles', maxCount: 1 }, { name: 'vsts', maxCount: 1 }])
	app.post('/',upload.single('audiofiles'), uploadFile);	//.single('userfile') must match name of file in app.js -> formData.append("userfile",
};
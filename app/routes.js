var Promise = require('bluebird');
var fs = require('fs');

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

function toMp3(fileName, outputName) {
	return new Promise(function(resolve, reject) {
		var command = SoxCommand();
		command.input(fileName);
		command.output(outputName)
			.outputFileType('mp3');

		addStandardListeners(command);
		command.run(reject, resolve);
	});
};

function deEss(fileName, outputName) {
	return new Promise(function(resolve, reject) {
		host.processAudio( fileName, outputName, [{name:vst_dir+"test_VST.dll", preset:vst_dir+"test_VST.fxp"}], resolve, reject);
	});
};


function CleanUp(file){
	fs.unlink(file, function(err) {
		if (err) console.log(err);
	});
}

function SendFile(file, res){
	var fileName = file.split('/workspace/').pop();
	var newLoc = appRoot+"/public/finished/"+fileName;
	fs.rename(file, newLoc);
	//host file for 8 hrs before deleting
	setTimeout( function(){
		CleanUp(newLoc);
	},  60 * 60 * 1000);
	res.status(200);
	res.send('finished/'+fileName);
}

function Convert(fn, fileName, outputName, res){
	fn(fileName,outputName)
		.then(function(){
			//delete input file
		    CleanUp(fileName);
			//send download link
			SendFile(outputName,res);
		});
}

function VSTprocess(fn, fileName, outputName, outputExt, res){
	var fin_extens = toMp3;
	fn(fileName, outputName)
		.then(function(){
			//delete input file
 			CleanUp(fileName);
		
			//if outputExt is not wav
			Convert(fin_extens, outputName, outputName.split('.').shift()+"."+outputExt, res);
			//else, send download link
		})
		.catch(function(){
			//broke VST
			console.log("something went wrong doing final conversion");
		});
}

var Upload = function(req, res) {
	var file = req.files.audiofiles;
	file.mv(workspace_dir + file.name, function(err) {
		if (err) {
			console.log(err);
			res.status(500).send(err);
		}
		else {
			//determine what process from req.body
			var vst = deEss;

			//process
			var origExt = file.name.split('.').pop();
			var outputWav = file.name.split('.').shift()+".wav";
			//default processing (conv to WAV, process, output WAV)
			toWav( workspace_dir + file.name, workspace_dir + outputWav )
			.then(function(){
				//delete input file
				CleanUp(workspace_dir + file.name);
				//goodCB -> process with VST
				VSTprocess(vst, workspace_dir + outputWav,  workspace_dir + "[tweak]"+outputWav, origExt, res);

			})
			.catch(function(){
				//errCB -> "woops, couldn't process your file"
				console.log("something went wrong in processing your file");
			});
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
	app.post('/process', Upload);
};
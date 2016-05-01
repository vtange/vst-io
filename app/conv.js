var SoxCommand = require('../index');

var fs = require('fs');

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

/* Concatenate all audio files in the list, streaming the result to outputPipe */
var mergeConv = function(fileNameList, outputPipe) {
	var command = SoxCommand();
	fileNameList.forEach(function addInput(fileName) {
		command.input(fileName);
	});
	command.output(outputPipe)
		.outputFileType('mp3')

	addStandardListeners(command);
	command.run()
	return command;
};

var runExamples = function() {
	var fileNameList = ['./assets/utterance_0.wav', 
		'./assets/utterance_1.wav', './assets/utterance_2.wav'];
	var outputPipe = fs.createWriteStream('./outputs/concat_and_pipe.mp3');

	
	console.log('\n Merge Convert example');
	mergeConv(fileNameList.slice(0, -1), outputPipe);
};

runExamples();
var multer  = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage, dest: './tmp/'});

var uploadFile = function(req, res) {
	console.log(req.files);
	var sampleFile = req.files.userfile;
	sampleFile.mv(__dirname + '/file.txt', function(err) {
		if (err) {
			console.log(err);
			res.status(500).send(err);
		}
		else {
			res.send('File uploaded!');
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
console.log("	APP/ROUTES.JS");
var multer  = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage, dest: './tmp/'});

var uploadFile = function(req, res) {
	console.log(req.file);
	res.send(JSON.stringify(req.file));
}

// app/routes.js
module.exports = function(app) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs', {
            title : app.title, // get the title
            user : req.user // get the user out of session and pass to template
        }); // load the index.ejs file
    });
	
 	// =====================================
    // UPLOAD ========
    // =====================================
	app.post('/',upload.single('userfile'), uploadFile);	//.single('userfile') must match name of file in app.js -> formData.append("userfile",
	
};
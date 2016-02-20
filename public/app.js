 document.addEventListener("DOMContentLoaded", function() {

	var processDropped = function(eventTarget){
        // let's just work with one file
        var file = eventTarget.dataTransfer.files[0];
        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.wav)$/;
        //console.log("Type: " + file.type);                        for debug use
        //console.log(regex.test(file.name.toLowerCase()));
        if (regex.test(file.name.toLowerCase())) {
                    var reader = new FileReader();
                    reader.onload = function(e) {
                            generateArr(e);
                    }
                    reader.readAsText(file);
        } else {
        alert("Please upload a valid CSV file.");
        }
	}
	var uploadedFileCheck = function(str){
		var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.tsv|.csv|.txt)$/;
        if (regex.test($(str).val().toLowerCase())) {
            if (typeof (FileReader) != "undefined") {
                var reader = new FileReader();
                reader.onload = function (e) {
                    generateArr(e);
                }
                reader.readAsText($(str)[0].files[0]);
            } else {
                alert("This browser does not support HTML5.");
            }
        } else {
            alert("Please upload a valid CSV file.");
        }
	}

    $("#upload").on("click", function () {
		uploadedFileCheck("#fileUpload",1);
    });

    ////////////////  drag and drop
	// prevent missed drops == load file
    var page = document.querySelector("html");
	page.addEventListener("dragover", function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "none";
    }, false);
    page.addEventListener("drop", function(e) {
        e.preventDefault();
        e.stopPropagation();
    }, false);

	//dropzone1 upload
    var dropzone = document.querySelector("#drop-zone");

    dropzone.addEventListener('dragleave', function (e) {
        if ($("#drop-zone").hasClass("onTop")) {
            $("#drop-zone").removeClass("onTop")
        }
    });

    dropzone.addEventListener("dragover", function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!$("#drop-zone").hasClass("onTop")) {
            $("#drop-zone").addClass("onTop")
        }
        e.dataTransfer.dropEffect = "copy";//mouse icon
    }, false);

    dropzone.addEventListener("drop", function(e) {
        e.preventDefault();
        e.stopPropagation();
        if ($("#drop-zone").hasClass("onTop")) {
            $("#drop-zone").removeClass("onTop")
        }
		processDropped(e, 1)
    }, false);

});
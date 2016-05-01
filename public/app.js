var _ = {

	getInteractables : function(){
		_.page = document.querySelector("html");
		_.uploadbtn = document.getElementById('upload-btn');
		_.fileupload = document.getElementById('fileUpload');
		_.dropzone = document.getElementById('drop-zone');
	},

	initEvents : function(){
		_.uploadbtn.addEventListener("click", function () {
			_.uploadedFileCheck();
		}),

		////////////////  drag and drop
		// prevent missed drops == load file
		_.page.addEventListener("dragover", function(e) {
			e.preventDefault();
			e.stopPropagation();
			e.dataTransfer.dropEffect = "none";
		}, false);
		_.page.addEventListener("drop", function(e) {
			e.preventDefault();
			e.stopPropagation();
		}, false);

		//dropzone1 upload
		_.dropzone.addEventListener('dragleave', function (e) {
			if (_.dropzone.classList.contains("onTop")) {
				_.dropzone.classList.remove("onTop")
			}
		});

		_.dropzone.addEventListener("dragover", function(e) {
			e.preventDefault();
			e.stopPropagation();
			if (!(_.dropzone.classList.contains("onTop"))) {
				_.dropzone.classList.add("onTop")
			}
			e.dataTransfer.dropEffect = "copy";//mouse icon
		}, false);

		_.dropzone.addEventListener("drop", function(e) {
			e.preventDefault();
			e.stopPropagation();
			if (_.dropzone.classList.contains("onTop")) {
				_.dropzone.classList.remove("onTop")
			}
			_.processDropped(e, 1)
		}, false);
	},

	processDropped : function(eventTarget){
        // let's just work with one file
        var file = eventTarget.dataTransfer.files[0];
        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.wav|.mp3|.ogg|.flac|.wma)$/;
        //console.log("Type: " + file.type);                        for debug use
        //console.log(regex.test(file.name.toLowerCase()));
        if (regex.test(file.name.toLowerCase())) {
				//PREPARE DATA AND SEND
					var formData = new FormData();

					// HTML file input, chosen by user
					formData.append("userfile", file);
					var request = new XMLHttpRequest();
					request.open("POST", window.location.href);
					request.send(formData);
        } else {
        alert("Please upload a valid CSV file.");
        }
	},
	uploadedFileCheck : function(){
		var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.wav|.mp3|.ogg|.flac|.wma)$/;
        if (regex.test(_.fileupload.value.toLowerCase())) {
            if (typeof (FileReader) != "undefined") {
				
				//PREPARE DATA AND SEND
					var formData = new FormData();

					// HTML file input, chosen by user
					formData.append("userfile", $("#fileUpload")[0].files[0]);
					var request = new XMLHttpRequest();
					request.open("POST", window.location.href);
					request.send(formData);
				
            } else {
                alert("This browser does not support HTML5.");
            }
        } else {
            alert("Please upload a valid CSV file.");
        }
	}

}

 document.addEventListener("DOMContentLoaded", function() {
	 _.getInteractables();
	 _.initEvents();
 });
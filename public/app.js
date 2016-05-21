var _ = {

	getInteractables : function(){
		_.page = document.querySelector("html");
		_.uploadbtn = document.getElementById('upload-btn');
		_.fileupload = document.getElementById('file-upload');
		_.filelabel = document.getElementById('file-upload').nextElementSibling;
		_.filename = _.filelabel.innerHTML;
		_.dropzone = document.getElementById('drop-zone');
		_.progressbar = document.getElementById('progress-bar');
	},

	initEvents : function(){

		////////////////  sends selected file
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
		
		////////////////  assign custom input
		_.fileupload.addEventListener( 'change', function( e )
		{
			var fileName = '';
			if( this.files && this.files.length > 1 )
				fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
			else
				fileName = e.target.value.split( '\\' ).pop();

			if( fileName )
				_.filelabel.querySelector( 'span' ).innerHTML = fileName;
			else
				_.filelabel.innerHTML = _.filename;
		});

		// Firefox bug fix
		_.fileupload.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
		_.fileupload.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });
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
					formData.append("userfile", $("#file-upload")[0].files[0]);

					// create request
					var request = new XMLHttpRequest();
					request.open("POST", window.location.href);

					// setup request
					request.upload.onprogress = function(e) {
					  if (e.lengthComputable) {
						var percentage = (e.loaded / e.total) * 100;
						$('div.progress div.bar').css('width', percentage + '%');
					  }
					};
					request.onerror = function(e) {
					  showInfo('An error occurred while submitting the form. Maybe your file is too big');
					};
					request.onload = function() {
					  showInfo(this.statusText);
					};

					//send request
					request.send(formData);
				
            } else {
                alert("This browser does not support HTML5.");
            }
        } else {
            alert("Please upload a valid CSV file.");
        }
	},
	showInfo: function(message) {
		$('div.progress').hide();
		$('strong.message').text(message);
		$('div.alert').show();
	}

}

 document.addEventListener("DOMContentLoaded", function() {
	 _.getInteractables();
	 _.initEvents();
 });
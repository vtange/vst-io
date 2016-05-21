var _ = {
	//used to check file extension
	validFiles : /^([a-zA-Z0-9\s_\\.\-:\(\)])+(.wav|.mp3|.ogg|.flac|.wma)$/,
	
	//used to check where user is on workflow
	state : { workflow : 1 },
	
	//[init at DOM load] gets HTML elements for targeting
	getInteractables : function(){
		_.page = document.querySelector("html");
		_.workflow = document.getElementById("workflow");
		_.uploadbtn = document.getElementById('upload-btn');
		_.fileupload = document.getElementById('file-upload');
		_.filelabel = document.getElementById('file-upload').nextElementSibling;
		_.filename = _.filelabel.innerHTML;
		_.dropzone = document.getElementById('drop-zone');
		_.progressbar = document.getElementById('progress-bar');
		_.next = document.getElementById('next-btn');
		_.back = document.getElementById('back-btn');
	},

	//[init after getInteractables] assigns events
	initEvents : function(){
		////////////////  OBJECT-WATCH state
		_.state.watch("workflow", function () {
			if(this.workflow===1){
				_.workflow.style.webkitTransform = 'translateX(-'+0+'%)';
				_.workflow.style.mozTransform    = 'translateX(-'+0+'%)';
				_.workflow.style.transform       = 'translateX(-'+0+'%)';
			}
			else{
				_.workflow.style.webkitTransform = 'translateX(-'+100+'%)';
				_.workflow.style.mozTransform    = 'translateX(-'+100+'%)';
				_.workflow.style.transform       = 'translateX(-'+100+'%)';
			}
		});

		////////////////  next cycles forward
		_.next.addEventListener("click", function () {
			_.cycleWorkflow();
		});

		////////////////  back cycles backward
		_.back.addEventListener("click", function () {
			_.cycleWorkflow();
		});

		////////////////  sends selected file
		_.uploadbtn.addEventListener("click", function () {
			_.sendFiles();
		});

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

		//////////////// default file add
		_.fileupload.addEventListener( 'change', function(e) {
			var fileName = '';/* prevent multi file upload for now
			if( this.files && this.files.length > 1 )
				fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
			else*/
				fileName = this.files[0].name;

			if( fileName )
				_.filelabel.querySelector( 'span' ).innerHTML = fileName;
			else
				_.filelabel.innerHTML = _.filename;
		});

		// Firefox bug fix
		_.fileupload.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
		_.fileupload.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });
	},
	//////////////// drag n drop file add
	processDropped : function(eventTarget){
        var file = eventTarget.dataTransfer.files[0];
        if (_.validFiles.test(file.name.toLowerCase())) {
			_.filelabel.querySelector( 'span' ).innerHTML = file.name;
			_.fileupload.files[0] = file;
        } 
		else {
			alert("One or more of your files is not a valid audio file.");
        }
	},
	sendFiles : function(){
        if (_.validFiles.test(_.fileupload.files[0].name.toLowerCase())) {
            if (typeof (FileReader) != "undefined") {
				//PREPARE DATA AND SEND
				var formData = new FormData();

				// HTML file input, chosen by user
				formData.append("userfile", _.fileupload.files[0]);

				// create request
				var request = new XMLHttpRequest();
				request.open("POST", window.location.href);

				// setup request
				request.upload.onprogress = function(e) {
				  if (e.lengthComputable) {
					var percentage = (e.loaded / e.total) * 100;
					_.progressbar.style.width = percentage + '%';
				  }
				};
				request.onerror = function(e) {
				  showInfo('An error occurred while submitting the form. Maybe your file is too big');
				};
				request.onload = function() {
				};

				//send request
				request.send(formData);
            } else {
                alert("This browser does not support HTML5.");
            }
        } else {
            alert("One or more of your files is not a valid audio file.");
        }
	},
	cycleWorkflow: function() {
		_.state.workflow = _.state.workflow === 1 ? 2 : 1;
	},
	showInfo: function(message) {
		//leftover Jquery
		$('div.progress').hide();
		$('strong.message').text(message);
		$('div.alert').show();
	}

}

 document.addEventListener("DOMContentLoaded", function() {
	 _.getInteractables();
	 _.initEvents();
 });
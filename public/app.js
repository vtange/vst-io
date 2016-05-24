var _ = {
	//used to check file extension
	validFiles : /^([a-zA-Z0-9\s_\\.\-:\(\)])+(.wav|.mp3|.ogg|.flac|.wma)$/,
	
	//[init at DOM load] gets HTML elements for targeting
	getInteractables : function(){
		_.page = document.querySelector("html");
		_.workflow = document.getElementById("workflow");
		_.placemarker = document.getElementById("place-marker");

		_.fileupload = document.getElementById('file-upload');
		_.filelabel = document.getElementById('file-upload').nextElementSibling;
		_.filename = _.filelabel.innerHTML;

		_.dropzone = document.getElementById('drop-zone');
		_.dropdown = document.getElementById('dropdown');
		_.list = document.getElementById('effects');

		_.next = document.getElementById('next-btn');
		_.back = document.getElementById('back-btn');
		_.uploadbtn = document.getElementById('upload-btn');
		_.progressbar = document.getElementById('progress-bar');
		_.progress = document.getElementById('progress');
		_.processing = document.getElementById('processing');
		_.finished = document.getElementById('finished');
		_.dllink = document.getElementById('finished-download');
	},

	//[init after getInteractables] assigns events
	initEvents : function(){
		////////////////  next cycles forward
		_.next.addEventListener("click", function (e) {
				_.workflow.style.webkitTransform = 'translateX(-'+100+'%)';
				_.workflow.style.mozTransform    = 'translateX(-'+100+'%)';
				_.workflow.style.transform       = 'translateX(-'+100+'%)';
				_.placemarker.style.webkitTransform = 'translateX('+100+'%)';
				_.placemarker.style.mozTransform    = 'translateX('+100+'%)';
				_.placemarker.style.transform       = 'translateX('+100+'%)';
				_.placemarker.style.borderColor       = '#f96c8d';
		});

		////////////////  back cycles backward
		_.back.addEventListener("click", function (e) {
				_.workflow.style.webkitTransform = 'translateX(-'+0+'%)';
				_.workflow.style.mozTransform    = 'translateX(-'+0+'%)';
				_.workflow.style.transform       = 'translateX(-'+0+'%)';
				_.placemarker.style.webkitTransform = 'translateX('+0+'%)';
				_.placemarker.style.mozTransform    = 'translateX('+0+'%)';
				_.placemarker.style.transform       = 'translateX('+0+'%)';
				_.placemarker.style.borderColor       = '#f97bf2';
				close(_.list);
		});

		////////////////  show effects list
		_.dropdown.addEventListener("click", function(e){
			toggle(_.list);
		});
		
		on('effects', 'click', 'li', function(e) {
			_.dropdown.querySelector( 'input' ).value = e.target.innerHTML;
			_.dropdown.querySelector( 'span' ).innerHTML = e.target.innerHTML; // this is the clicked list item
			toggle(_.list);
		});
		
		
		////////////////  sends selected file
		_.uploadbtn.addEventListener("click", function (e) {
			if(_.fileupload.files[0]){
				close(_.list);
				close(_.processing);
				close(_.finished);
				open(_.progress);
				_.workflow.style.webkitTransform = 'translateX(-'+200+'%)';
				_.workflow.style.mozTransform    = 'translateX(-'+200+'%)';
				_.workflow.style.transform       = 'translateX(-'+200+'%)';
				_.placemarker.style.webkitTransform = 'translateX('+200+'%)';
				_.placemarker.style.mozTransform    = 'translateX('+200+'%)';
				_.placemarker.style.transform       = 'translateX('+200+'%)';
				_.placemarker.style.borderColor       = '#f97c45';
				_.sendFiles();
			}
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
				_.uploadbtn.classList.remove("disabled");

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
			_.uploadbtn.classList.remove("disabled");
        }
		else {
			alert("One or more of your files is not a valid audio file.");
        }
	},
	sendFiles : function(){
        if (_.validFiles.test(_.fileupload.files[0].name.toLowerCase())) {
            if (typeof (FileReader) != "undefined") {
				////PREPARE DATA AND SEND
				var formData = new FormData();
				
				//// HTML file input, chosen by user
				formData.append("vsts", _.dropdown.querySelector( 'input' ).value);
				formData.append("audiofiles", _.fileupload.files[0]);

				//// create request
				var request = new XMLHttpRequest();
				request.open("POST", window.location.href+"process");
				
				//// setup request
				//request.setRequestHeader('Content-Type', 'multipart/form-data');
				//enable upload progress
				request.upload.onprogress = function(e) {
				  if (e.lengthComputable) {
					var percentage = (e.loaded / e.total) * 100;
					_.progressbar.style.width = percentage + '%';
						if(!percentage<100){
							//100% upload, begin processing.
							close(_.progress);
							open(_.processing);
						}
				  }
				};
				request.onerror = function(e) {
				  showInfo('An error occurred while submitting the form. Maybe your file is too big');
				};
				request.onload = function(e) {
					close(_.processing);
					_.dllink.setAttribute('href',window.location.href+e.target.response);
					_.dllink.setAttribute('download',e.target.response.split('finished/').pop());
					open(_.finished);
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

function on(elSelector, eventName, selector, fn) {
	var element = document.getElementById(elSelector);

	element.addEventListener(eventName, function(event) {
		var possibleTargets = element.querySelectorAll(selector);
		var target = event.target;

		for (var i = 0, l = possibleTargets.length; i < l; i++) {
			var el = target;
			var p = possibleTargets[i];

			while(el && el !== element) {
				if (el === p) {
					return fn.call(p, event);
				}

				el = el.parentNode;
			}
		}
	});
}




function toggle(element) {
	if (!element.classList.contains("hidden")) {
		element.classList.add("hidden");
	}
	else{
		element.classList.remove("hidden");
	}
}

function close(element) {
	if (!element.classList.contains("hidden")) {
		element.classList.add("hidden");
	}
}

function open(element) {
	if (element.classList.contains("hidden")) {
		element.classList.remove("hidden");
	}
}
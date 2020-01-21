$j=jQuery.noConflict();
$j(document).ready(function() {

	function setActiveCookie(cookieValue) {
	    var d = new Date();
	    d.setTime(d.getTime() + (365*24*60*60*1000)); // 1 jaar
	    var expires = "expires="+ d.toUTCString();
	    document.cookie = 'cl_visitor_email' + "=" + cookieValue + ";" + expires + ";path=/";
	}


	function validateEmail(email) {
	    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(String(email).toLowerCase());
	}

	// if gform submit: prevent submission, add email to localStorage and submit.
		document.querySelector('form[id^="gform"]')
			.addEventListener("submit", function (e) {
	    // stop the normal behavior
	    e.preventDefault();

	    // get the email value out of the form
	    var submittedEmail = document.querySelector('form[id^="gform"] .ginput_container_email input').value;
	    if (validateEmail(submittedEmail)) {
	    		// set the email in localStorage & cookie
	    		localStorage.setItem("visitorEmail", submittedEmail);
	    		setActiveCookie(submittedEmail);
	      }
	    // release default
	    this.submit();
		});

		function cl_get_gfields(){
			$j.ajax({
				url : ajaxObject.url,
				type : 'get',
				cache : false,
				dataType: 'JSON',
				data : {
					action : 'cl_get_gf_feeds',
					security : ajaxObject.nonce,
					'form_id' : ajaxObject.formID
				}
			}).done(function(result){
				// get connected gfields and pass them to cl_active_curl
				if(result != 0){
					cl_active_curl(result);
				}

			}).fail(function(error){
				console.log(error);
			});
		}

		function cl_active_curl(gfields){
			$j.ajax({
				url : ajaxObject.url,
				type : 'get',
				cache : false,
				dataType: 'JSON',
				data : {
					action : 'cl_active_curl',
					security : ajaxObject.nonce,
					formID : ajaxObject.formID
				}
			}).done(function(result){
				// loop through gfields from cl_get_gfields
				for (i = 0; i < gfields.length; i++) {
						var curr_fieldname = gfields[i].fieldName;
						var curr_fieldId = gfields[i].fieldId;
						// if fieldname isset in active_curl --> fill in form
						if( typeof result[curr_fieldname] != 'undefined') {
							$j("#input_" + ajaxObject.formID + "_" + curr_fieldId).val(result[curr_fieldname]);
						}

				}

			}).fail(function(error){
				console.log(error);
			});
		} // end: cl_populate_form()

		cl_get_gfields();


});

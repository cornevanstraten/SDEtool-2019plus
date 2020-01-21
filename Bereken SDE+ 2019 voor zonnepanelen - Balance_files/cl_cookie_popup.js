/* csc */
$j=jQuery.noConflict();
$j(document).ready(function() {
	var unix_time = Math.round((new Date()).getTime() / 1000);

	function show_cookie_popup(){
		if ( cookieAjaxObject.disable_popup == 1 ) { return; }

		// insert inline style to head
		$j.ajax({
			url : cookieAjaxObject.url,
			type : 'get',
			data : {
				action : 'cl_cookie_insert_style',
				security : cookieAjaxObject.nonce,
			}
		}).done(function(inline_style){
			$j('head').append(inline_style);
		}).fail(function(error){
			console.log(error);
		});

		// insert popup to footer
		$j.ajax({
			url : cookieAjaxObject.url,
			type : 'get',
			data : {
				action : 'cl_cookie_prepare_popup',
				security : cookieAjaxObject.nonce,
			}
		}).done(function(popup_html){
			$j("body").append(popup_html);

			setTimeout(function(){
				$j('.cl_cookie_notice_container').fadeIn(),400;

				// start ajax update view
				$j.ajax({
					url : cookieAjaxObject.url,
					type : 'post',
					data : {
						action : 'cl_cookie_update_shows',
						security : cookieAjaxObject.nonce,
					}
				}).done(function(){
					$j("body").addClass('cookie_popup_open');
				}).fail(function(error){
					console.log(error);
				});
			}, 1500); // end: timeout

			window.dataLayer = window.dataLayer || [];
			dataLayer.push({
				"event": "cookie-popup",
				"CookieCategory": "cookie-popup",
				"CookieAction": "cookie-popup-shown",
				"CookieLabel": "cookie-popup-shown"
			});

			jQuery.fn.shake = function() {
				if (jQuery(window).width() > 767) {
			    this.each(function(i) {
			    	if (screen.width >= 770) {
			        for (var x = 1; x <= 2; x++) {
			            $j(this).animate({
			                right : 25
			            }, 60).animate({
			                right : 30
			            }, 90).animate({
			                right : 25
			            }, 60).animate({
			                right : 30
			            }, 90);
			        }
			       }
			    });
			    return this;
			 	}
			}

			setTimeout(function(){
			              setInterval(function() {
			                  $j('.cl_cookie_notice_container').shake();
			              }, 9000);
			    },100);


		}).fail(function(error){
			console.log(error);
		}); // end: done/fail van ajax insert popup
	} // end: show_cookie_popup()

	// check cookie and call wall
	$j.ajax({
		url : cookieAjaxObject.url,
		type : 'get',
		dataType: 'html',
		data : {
			action : 'cl_get_cookie_value',
			security : cookieAjaxObject.nonce,
		}
	}).done(function(cookie){
		if( cookie == 'not set'){
			show_cookie_popup();
		} // else { console.log( 'cl_cookie set: ' + cookie )}
	});

	$j(document).on("click",".cl_cookie_notice_container .btn.accept", function(){
		window.dataLayer = window.dataLayer || [];
		dataLayer.push({
			"event": "cookie-popup",
			"CookieCategory": "cookie-popup",
			"CookieAction": "cookie-popup-clicked",
			"CookieLabel": "cookie-popup-accept"
		});

		cookie.set({
			'cl_cookie_consent': 1,
			'cl_cookie_time': unix_time },
			{ expires: 365, path: '/'  }
			);
		// start ajax update accept
		$j.ajax({
			url : cookieAjaxObject.url,
			type : 'post',
			data : {
				action : 'cl_cookie_update_accept',
				security : cookieAjaxObject.nonce,
			}
		});
		// end: ajax
		location.reload();
	});

	$j(document).on("click","#cl_cookie_reject", function(){
		window.dataLayer = window.dataLayer || [];

		dataLayer.push({
			"event": "cookie-popup",
			"CookieCategory": "cookie-popup",
			"CookieAction": "cookie-popup-clicked",
			"CookieLabel": "cookie-popup-reject"
		});

		cookie.set({
			'cl_cookie_consent': 0,
			'cl_cookie_time': unix_time
		},{ expires: 60, path: '/' }
		);
		$j('.cl_cookie_notice_container').fadeOut(400);

		// start ajax update reject
		$j.ajax({
			url : cookieAjaxObject.url,
			type : 'post',
			data : {
				action : 'cl_cookie_update_reject',
				security : cookieAjaxObject.nonce,
			}
		});
		// end: ajax
	});

	// start ajax update cookiepage
	$j(document).on("click",".cl_cookie_notice_container .cookieread", function(){
		$j.ajax({
			url : cookieAjaxObject.url,
			type : 'post',
			data : {
				action : 'cl_cookie_update_cookieread',
				security : cookieAjaxObject.nonce,
			}
		});
		// end: ajax

	});

});


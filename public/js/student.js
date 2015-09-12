$(function() {
	$(".selector").click(function() {
		var parent = $(this).parent()
		var selectors = parent.find(".selector")
		
		selectors.removeClass("selected")
		parent.find(".score").val($(this).data("score"))
		$(this).addClass("selected")
		
		if($(".selector.selected").length == $(".item").length)
			$(".form .button").removeAttr("disabled")
	})
	
	$(".form").submit(function(e) {
		e.preventDefault()
		e.stopPropagation()
		
		var form = $(this)
		var button = form.find(".button")
		var data = {
			_csrf: config.csrf,
			answers: form.find(".item").map(function() {				
			  return {
				  question: $(this).data("question"),
				  score: $(this).find(".score").val()
			  }
		  }).get()
		}
		
		button.text("SENDING...")
	  
	  $.post(form.attr("action"), data, function(response) {
		  button.toggleClass("error", !response.success)
		  
		  if(response.success) {
			  button.text("SENT")
			  
			  setTimeout(function() {
          location.href = response.next
        }, 500)
	    } else {
		    button.text(response.message || "Something went wrong :(")
	    }
	  })
	})
})
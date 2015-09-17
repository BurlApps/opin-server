$(function() {		
	var now = new Date()
	
	$(".selector").on("click", function(e) {		
		var button = $(this)
		var parent = button.parent()
		var selectors = parent.find(".selector")
		
		selectors.removeClass("selected")
		parent.find(".score").val($(this).data("score"))
		button.addClass("selected")
		
		if($(".selector.selected").length == $(".item").length)
			$(".form .button").removeAttr("disabled")
			
		if(config.bTester) nextQuestion()
	})
	
	$(".form").submit(function(e) {
		e.preventDefault()
		e.stopPropagation()
		
		var dif = (new Date()).getTime() - now.getTime()
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
			  
			  if(mixpanel.time_event)
				  mixpanel.track("Survey Taken", {
					  Tester: config.bTester ? "B" : "A",
					  Survey: config.survey,
					  Questions: config.questionLength,
					  Time: Math.abs(dif / 1000)
					})
			  
			  setTimeout(function() {				  
          location.href = response.next
        }, 500)
	    } else {
		    button.text(response.message || "Something went wrong :(")
	    }
	  })
	})
	
	function nextQuestion() {
		var element = $(".item.active")
		var next = element.data("next")
		
		if(next == "stop") {
			element
			.find(".question")
			.text("SENDING...")
			.next(".selectors")
			.hide()
			
			$(".bottom").hide()
			$(".form").submit()
		} else {
			element
			.removeClass("active")
			.hide()
			
			$(".bottom span").text(parseInt(next) + 1)
			
			$(".item." + next)
				.addClass("active")
				.removeClass("hidden")
		}
			
		
	}
})
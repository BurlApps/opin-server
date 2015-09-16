$(function() {		
	$(".form").submit(function(e) {
		e.preventDefault()
		e.stopPropagation()
		
		var form = $(this)
		var input = form.find(".input").val()
		
		if(input.length > 0)
			window.location.href = "/surveys/" + input 
	})
})
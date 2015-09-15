$(function() {
  // Dashboard Profile Toggle
  $(".profile").click(function(e) {
	  e.stopPropagation()
	  $(this).siblings().find(".dropdown").hide()
    $(this).find(".dropdown").toggle()
  })
  
  $("body").click(function() {
	  $(".dropdown").hide()
  })
  
  $(document).keydown(function(event){
    if((event.keyCode == 13)) {
      event.preventDefault()
      return false
    }
  })
  
  $(".data-table tbody tr").click(function() {
		window.location.href = $(this).data("href")
  })
  
  $(".builder-table").on("keypress keyup", "tr.empty .input", function() {
	  var tr = $(this).parents("tr")
	  var count = $(".builder-table tbody tr:not(.hidden)").size()
	  
	  if($(this).val().length > 0) {
	  	tr.removeClass("empty")
	  		.find(".input")
	  		.prop("required", true)
	  	
	  	$(".builder-table tbody tr.hidden").before(
	  		$("tr.hidden").clone()
		  		.removeClass("hidden")
	  			.addClass("empty")
	  			.find(".tag")
	  			.val("Question " + (count + 1))
	  			.parents("tr")
	  			.show()
	  	)
	  }
  })
  
  $(".builder-table").on("keypress keyup", "tr .input.tag", function() {
		var tr = $(this).parents("tr")
		var length = $(this).val().length
		var max = $(this).attr("maxlength")
			
		tr.find(".counter")
			.text("length: " + length + "/" + max)
			.toggle(length > 0)
	})
  
  $(".builder-table").on("click", "tr:not(.empty) td.remove", function() {
	  $(this).parents("tr").remove()
  })
  
  $(".new-question").click(function() {
	  var hidden = $(".builder-table tbody tr.hidden")
	  var empty = $(".builder-table tbody tr.empty")
	  var count = $(".builder-table tbody tr:not(.hidden)").size()
	  var insertBefore = hidden
	  
	  if(empty.index() > 0) insertBefore = empty
	  
	  insertBefore.before(
  		$("tr.hidden").clone()
  			.removeClass("hidden")
  			.find(".tag")
  			.val("Question " + (count + 1))
  			.parents("tr")
  			.show()
  	)
  })
  
  $(".content .search").on("keypress keyup", function() {
    searchTerm = $(this).val().trim().toLowerCase()

    if(searchTerm.length > 0) {
      $(".data-table tbody tr").each(function() {
        var title = $(this).find("td").eq(1).text().trim().toLowerCase()
        $(this).toggle(title.indexOf(searchTerm) > -1)
      })
    } else {
      $(".data-table tbody tr").show()
    }
	})
  
  $(".builder-form").submit(function(e) {
	  e.stopPropagation()
	  e.preventDefault()
	  
	  if(!e.target.checkValidity())
	  	return swal({
        title: "Oops...",
        text: "Looks like some information is missing.",
        type: "error",
        confirmButtonColor: "#D23939"
      })
	  
	  var form = $(this)
	  var button = form.find(".new-button")
	  var mode = config.mode.slice(0, -1).toUpperCase()
	  var data = {
		  _csrf: config.csrf,
		  name: form.find(".survey-name").val(),
			questions: form.find("tbody tr:not(.empty):not(:hidden)").map(function() {				
			  return {
				  id: $(this).data("question"),
				  tag: $(this).find(".tag").val(),
				  question: $(this).find(".question").val()
			  }
		  }).get()
	  }
	  
	  if(data.questions.length == 0)
	  	return swal({
        title: "Oops...",
        text: "Looks like some information is missing.",
        type: "error",
        confirmButtonColor: "#D23939"
      })
	  
	  button.val(mode + "ING...")
	  
	  $.post(form.attr("action"), data, function(response) {
		  if(response.success) {
			  button.val(mode + "ED")
			  
			  swal({
		      title: "Your Survey Has<br>Been " + config.mode + "d!",
		      html: true,
		      type: "success",
		      confirmButtonColor: "#38A0DC",
		    },	function() {
	        setTimeout(function() {
	          location.href = response.next
	        }, 500)
	      })
	    } else {
		    button.val(mode + "E")
		    
		    swal({
	        title: "Oops...",
	        html: true,
	        text: response.message || "Something went wrong :(<br> Call or text Brian at (310) 849-2533 if this<br>keeps recurring.",
	        type: "error",
	        confirmButtonColor: "#D23939"
	      })
	    }
	  })
  })
})

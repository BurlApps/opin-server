$(function() {
  var enablePosting = true

  $("form:not(.ignore)").on("submit", function(e) {
    e.preventDefault()
    e.stopPropagation()
    
    var form = $(this)
    var button = form.find(".button")
    var message = "sending..."
    
    if(!e.target.checkValidity()) {
      message = "Please Fill Out All Fields"
      button.addClass("error").val(message).text(message)

    } else if(enablePosting) {
      enablePosting = false
      button.val(message).text(message)

      $.post(form.attr("action"), form.serialize(), function(response) {
        button.toggleClass("error", !response.success)
	      button.toggleClass("active", response.success)

        if(response.success) {
	        message = response.message || "Awesome :)"
	        button.val(message).text(message)

          if(response.user && typeof mixpanel.get_distinct_id != "undefined") {
            mixpanel.alias(response.user, mixpanel.get_distinct_id())
            mixpanel.people.set({
              ID: response.user,
              $name: response.name,
              $email: response.email,
            })
          }

	      	setTimeout(function() {
            window.location.href = response.next
          }, response.delay || 300)
        } else {
	        enablePosting = true
	        message = response.message || "Something Went Wrong :("
	        button.val(message).text(message)
	        form.find("input[type=password]").val("")
        }
      })
    }
  })
})

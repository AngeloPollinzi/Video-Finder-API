$(document).ready(function(){
	$("#submitter").click(function(){
		$.ajax({
            type: "POST",
            url: "/getData",
            data: $("#pageUrlContainer").val(),
            dataType: 'application/json',
            success: function (output, textStatus, XMLHttpRequest) {
                console.log(output);
                console.log("success!");
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                console.log(XMLHttpRequest.status);
            }
        });
	});

});

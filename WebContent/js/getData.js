$(document).ready(function(){
	$("#submitter").click(function(){
		
		$('.json-object.json-field.clearfix ').empty();
		
		var offset = $(this).offset(); 
		offset.left -= 20;
		offset.top -= 20;
		$('html, body').animate({
		    scrollTop: offset.top,
		    scrollLeft: offset.left
		});
		
		$.ajax({
            type: "GET",
            url: "/getData",
            data:{'&pageUrl':encodeURIComponent($("#pageUrlContainer").val())},
            dataType: 'json',
            success: function (output, textStatus, XMLHttpRequest) {
            	$.each(output, function(key, value) {
            		if(key !== "url"){
            			var elements = $();
        			    elements = elements.add($('<div />', {"class": 'json-label col-xs-12 col-sm-4 col-md-2'}).append($('<span />', {"class": 'label',text: key})));
        			    elements = elements.add($('<div />', {"class": 'json-content col-xs-12 col-sm-8 col-md-10',text: value}));
        			    $('.json-object.json-field.clearfix ').append($('<div />', {"class": 'json-string json-field clearfix row '}).append(elements));
            		}else{
            			var elements = $();
        			    elements = elements.add($('<div />', {"class": 'json-label col-xs-12 col-sm-4 col-md-2'}).append($('<span />', {"class": 'label',text: key})));
        			    elements = elements.add($('<div />', {"class": 'json-content col-xs-12 col-sm-8 col-md-10'}).append($('<video />', {"controls":'',"width":640}).append($('<source />', {"src":value}))));
            			$('.json-object.json-field.clearfix ').append($('<div />', {"class": 'json-value json-field clearfix row '}).append(elements));
            		}
            	});
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
            	console.log("error!");
            	console.log(XMLHttpRequest.status);
            }
        });
	});
	
	$(document).ajaxStart(function () {
        $("#loading").show();
    }).ajaxStop(function () {
        $("#loading").hide();
    });

});

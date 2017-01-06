$(window).scroll(function() {
   if($(window).scrollTop() + $(window).height() > $(document).height() - 500) {
       alert("near bottom!");
   }
});

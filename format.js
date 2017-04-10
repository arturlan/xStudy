$(document.body).click(function() {

    if ($("div:first").is(":hidden")) {
        $("div").slideDown("slow");
    } else {
        $("div").hide();
    }
});


$(document).ready(function() {
    $('h3').click(function () {
        var $stext = $(this).next('p').stop(true, true);
        if ( $stext.is( ":hidden" ) ) {
            $stext.slideDown(800);
        } else {
            $stext.hide(800);
        }
    });
});

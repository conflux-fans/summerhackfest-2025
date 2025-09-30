
import $ from 'jquery'; 
function Tg(){

    $(document).ready(function() {
      // Initialize the Collapse plugin
    
        $("body").toggleClass("sidebar-toggled");
        $(".sidebar").toggleClass("toggled");
        if ($(".sidebar").hasClass("toggled")) {
          $('.sidebar .collapse').collapse('hide');
        };
    
    
    
    });

};

export default Tg;
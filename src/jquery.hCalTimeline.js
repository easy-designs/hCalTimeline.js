/*------------------------------------------------------------------------------
Function:       hCalTimeline()
Author:         Aaron Gustafson (aaron at easy-designs dot net)
                Daniel Ryan (daniel at easy-designs dot net)
Creation Date:  2009-08-27
Version:        0.1
Homepage:       http://github.com/easy-designs/hCalTimeline.js
License:        MIT License (see homepage)
Note:           If you change or improve on this script, please let us know by
                emailing the author (above) with a link to your demo page.
------------------------------------------------------------------------------*/
(function(){
  
  jQuery.fn.toTimeline = function(){
    return this.each(function(){
      new hCalTimeline( this );
    });
  }
  
  function hCalTimeline( el )
  {
    // public properties
    this.version = '0.1';
    
    // private properties
    var 
    els = {
      'div': document.createElement('div'),
      'ol':  document.createElement('ol'),
      'li':  document.createElement('li')
    },
    total_width = 0,
    curr_position = 0,
    stage = false;
    
    // methods
    function initialize( el )
    {
      
    }
    function move( direction )
    {
      
    }
    
    // start it up
    initialize();
  };
  
})();
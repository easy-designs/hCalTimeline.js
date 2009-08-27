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
(function($){
  
  $.fn.toTimeline = function( settings ){
    return this.each(function(){
      new hCalTimeline( this, settings );
    });
  };
  
  var hCalTimeline = function( content, settings )
  {
    // public
    this.name    = 'hCalTimeline';
    this.version = '0.1';
    
    // private
    var
    
    // elements
    $content      = $(content),
    $stage        = false,
    $els          = {
      div: $( document.createElement('div') ),
      ol:  $( document.createElement('ol') ),
      li:  $( document.createElement('li') )
    },
    
    // properties
    total_width   = 0,
    curr_position = 0,
    settings      = $.extend(
      {
        namespace: this.name + '-',
        style_id:  this.name + '-' + 'styles'
      },
      settings
    ),
    
    // styles
    styles  = '' +
      '.' + settings.namespace + 'stage { overflow: hidden; position: relative; height: 200px; }' +
      '.' + settings.namespace + 'timeline { position: absolute; top: 0; left: 0; border-bottom: 10px solid; width: 100%; }' +
      '.' + settings.namespace + 'event { position: absolute; }' +
      '';
    
    
    
    function initialize()
    {
      // apply the styles
      if ( $('style#'+settings.style_id).length < 1 )
      {
        $('<style id="' + settings.style_id + '" media="screen">' + styles + '</style>').appendTo('head');
      }
      
      // create the stage
      $stage = $els.div.clone().addClass(settings.namespace + 'stage');
      
      // create the list
      $timeline = $els.ol.clone()
                         .addClass(settings.namespace + 'timeline')
                         .appendTo($stage);
      
      // events
      $content.find('.vevent').each(function(){
        var $this = $(this);
        $els.li.clone().html($this.html())
                       .attr('class',$this.attr('class'))
                       .addClass(settings.namespace + 'event')
                       .appendTo($timeline);
      });
      
      // replace it all
      $content.replaceWith($stage);
    }
    
    // event handlers
    function move( e )
    {
      $el = $( e.target );
      
    }
    function scroll( e )
    {
      $el = $( e.target );
      
    }
    
    // start it up
    initialize();
  };
  window.hCalTimeline = hCalTimeline;
  
})(jQuery);
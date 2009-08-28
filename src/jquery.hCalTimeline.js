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
    $timeline     = false,
    $measure      = false,
    $els          = {
      div: $( document.createElement('div') ),
      ol:  $( document.createElement('ol') ),
      li:  $( document.createElement('li') )
    },
    
    // properties
    timeline_width = 0,
    curr_position  = 0,
    settings       = $.extend(
      {
        // namespace for CSS
        namespace: this.name + '-',
        // id for the style element (for in-house styles)
        style_id:  this.name + '-' + 'styles',
        // should be contained by a column?
        contain:   false,
        // default event width (in px)
        event_x:   200,
        // lrt or rtl?
        direction: 'ltr'
      },
      settings
    ),
    
    // styles
    styles  = '' +
      '.' + settings.namespace + 'stage { position: relative; }' +
      '.' + settings.namespace + 'contained { overflow: hidden; height: 200px; }' +
      '.' + settings.namespace + 'timeline { position: relative; list-style: none; border-bottom: 10px solid; margin: 0; padding: 0; }' +
      '.' + settings.namespace + 'stage .' + settings.namespace + 'timeline { position: absolute; top: 0; left: 0; min-width: 100%; }' +
      '.' + settings.namespace + 'event { position: absolute; }' +
      '';
    
    
    
    function initialize()
    {
      var timeline_height, event_height, scale, space;
      
      // apply the styles
      if ( $('style#'+settings.style_id).length < 1 )
      {
        $('<style id="' + settings.style_id + '" media="screen">' + styles + '</style>').appendTo('head');
      }
      
      // create the list
      $timeline = $els.ol.clone().addClass(settings.namespace + 'timeline');
      $content.replaceWith($timeline);
      // if there's a height assigned in CSS, use it as the baseline
      timeline_height = $timeline.height();
      
      // events
      $content.find('.vevent').each(function(){
        var
        $this = $(this),
        $event = $els.li.clone().html($this.html())
                                .attr('class',$this.attr('class'))
                                .addClass(settings.namespace + 'event')
                                .appendTo($timeline);
        
        // get the date
        $event.data('start_date', parseDate( $event.find('.dtstart').attr('title') ) );
        $event.data('end_date', $event.find('.dtend').attr('title') );
        if ( $event.data('end_date') ){ $event.data('end_date', parseDate( $event.data('end_date') ) ); }
        
        if ( typeof( $timeline.start_date ) == 'undefined' ||
             $event.data('start_date') < $timeline.start_date )
        {
          $timeline.start_date = $event.data('start_date');
        }
        if ( typeof( $event.data('end_date') ) != 'undefined' &&
             ( typeof( $timeline.end_date ) == 'undefined' ||
               $timeline.end_date < $event.data('end_date') ) )
        {
          $timeline.end_date = $event.data('end_date');
        }
        else if ( typeof( $timeline.end_date ) == 'undefined' ||
                  $timeline.end_date < $event.data('start_date') )
        {
          $timeline.end_date = $event.data('start_date');
        }
        
        // update the widths
        if ( settings.event_x )
        {
          $event.width(settings.event_x);
          timeline_width += settings.event_x;
        }
        else
        {
          timeline_width += $event.width();
        }
        // update the height
        event_height = $event.height();
        if ( event_height > timeline_height )
        {
          timeline_height = event_height;
        }
        
      });
      // assign the initial dimensions to the timeline
      $timeline.width(timeline_width).height(timeline_height);
      
      // make sure we give the last item enough room to breathe
      space = $timeline.children('li:last-child').width();
      
      // now to determine the layout - positioning by % should work best
      // (so we only need to enlarge the timeline, not reposition each time)
      scale = ( $timeline.end_date.getTime() - $timeline.start_date.getTime() ) / ( timeline_width - space );
      $timeline.children('li').each(function(){
        var
        $this = $(this),
        start = $this.data('start_date'),
        end   = $this.data('end_date') || false;
        
        // find the starting edge
        start = Math.floor( ( ( start.getTime() - $timeline.start_date.getTime() ) / scale ) / timeline_width * 100 );
        $this.css((settings.direction=='ltr'?'left':'right'),start+'%');
        
        if ( end instanceof Date )
        {
          $this.width( Math.floor( ( end.getTime() - start.getTime() ) / scale ) );
        }
        
        // TODO: check for overlaps & reposition events or grow timeline to accomodate
        
      });
      
      // add to the stage
      $stage = $els.div.clone().addClass(settings.namespace + 'stage');
      $timeline.wrap($stage);
      
      // create the measure
      $measure = $els.ol.clone().addClass(settings.namespace + 'measure');
      // TODO: determine the years and append a LI for each.
      
      // wrap?
      if ( settings.contain )
      {
        $stage.addClass(settings.namespace + 'contained').height(timeline_height);
      }
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
    
    // utils
    function parseDate( string )
    {
      /* A conversion of Paul Sowden's extension to the Date object
       * http://delete.me.uk/2005/03/iso8601.html */
      var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +                  // date
                   "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +  // time
                   "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?",             // offset
      d = string.match(new RegExp(regexp)),
      offset = 0,
      date = new Date(d[1], 0, 1);
      
      // build the date
      if (d[3]) { date.setMonth(d[3] - 1); }
      if (d[5]) { date.setDate(d[5]); }
      if (d[7]) { date.setHours(d[7]); }
      if (d[8]) { date.setMinutes(d[8]); }
      if (d[10]) { date.setSeconds(d[10]); }
      if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
      
      // calculate the final date
      if (d[14]) {
          offset = (Number(d[16]) * 60) + Number(d[17]);
          offset *= ((d[15] == '-') ? 1 : -1);
      }
      offset -= date.getTimezoneOffset();
      time = (Number(date) + (offset * 60 * 1000));
      date.setTime(Number(time));
      
      return date;
    }
    
    // start it up
    initialize();
  };
  window.hCalTimeline = hCalTimeline;
  
})(jQuery);
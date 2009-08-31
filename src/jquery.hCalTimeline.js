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
  $.fn.reverse = [].reverse;
  
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
      '.' + settings.namespace + 'event { position: absolute; bottom: 0; border: 1px solid; border-bottom: 10px solid; width: 0; }' +
      '.' + settings.namespace + 'event .vevent { position: absolute; top: 0; }' +
      '.' + settings.namespace + 'measure { position: absolute; bottom: -1em; list-style: none; margin: 0; padding: 0; }' +
      '.' + settings.namespace + 'measure li { position: absolute; margin: 0; padding: 0; }' +
      '';
    
    
    
    function initialize()
    {
      var timeline_height, event_height, scale, space, start, end, current, position, $event, $next, $flag, height;
      
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
        $this  = $(this), year,
        $flag  = $els.div.clone().html($this.html())
                                 .attr('class',$this.attr('class')),
        $event = $els.li.clone().append($flag)
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
          $flag.width(settings.event_x);
          timeline_width += settings.event_x;
        }
        else
        {
          timeline_width += $flag.width();
        }
        // update the height
        event_height = $flag.height();
        $event.height(event_height);
        if ( event_height > timeline_height )
        {
          timeline_height = event_height;
        }
        
      });
      
      // set the start and end dates to January 1st
      $timeline.start_date = new Date( $timeline.start_date.getFullYear(), 0, 1 );
      $timeline.end_date = new Date( $timeline.end_date.getFullYear() + 1, 0, 1 );
      
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
        $this.find('.vevent').css((settings.direction=='ltr'?'left':'right'),0);
        
        if ( end instanceof Date )
        {
          $this.width( Math.floor( ( end.getTime() - start.getTime() ) / scale ) );
        }
      })
      .height(timeline_height);
      
      // adjust the heights as necessary, starting from the end
      $event = $timeline.children('li:last');
      while ( $event.length === 1 )
      {
        $flag  = $event.find('.vevent');
        height = $event.height();
        
        $event.nextAll('li').reverse().each(function(){
          $next = $(this).find('.vevent');
          while ( isOverlapping( $flag, $next ) )
          {
            timeline_width += (height/2);
            height += (height/2);
            $event.height(height);
            $timeline.width(timeline_width);
          }
        });
        
        if ( height > timeline_height )
        {
          timeline_height = height;
          $timeline.height(height);
        }
        
        $event = $event.prev('li');
      }
      // reset the scale
      scale = ( $timeline.end_date.getTime() - $timeline.start_date.getTime() ) / ( timeline_width - space );
      
      // add to the stage
      $stage = $els.div.clone().addClass(settings.namespace + 'stage')
                               .height(timeline_height);
      $timeline.wrap($stage);
      
      // create the measure
      $measure = $els.ol.clone().addClass(settings.namespace + 'measure')
                                .width(timeline_width);
      $timeline.after($measure);
      start = $timeline.start_date;
      for ( current = start.getFullYear(), end = $timeline.end_date.getFullYear();
            current < end; current++ )
      {
        position = Math.floor( ( ( new Date( current, 0, 1 ).getTime() - start.getTime() ) / scale ) / timeline_width * 100 );
        $els.li.clone().text(current)
                       .css((settings.direction=='ltr' ? 'left' : 'right' ),position+'%')
                       .appendTo($measure);
      }
      
      // wrap?
      if ( settings.contain )
      {
        $stage.addClass(settings.namespace + 'contained');
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
    function isOverlapping( subject, object )
    {
      var s, o,
      $subject = $(subject),
      $object  = $(object),
      width    = $object.outerWidth(),
      height   = $object.outerHeight();
      
      // figure out the 4 corners of $subject & $object
      s = getCorners( $subject );
      o = getTrueOffsets( $object );
      
      switch ( true )
      {
        case isOver( s.top, s.left, o.top, o.left, height, width ):
        case isOver( s.top, s.right, o.top, o.left, height, width ):
        case isOver( s.bottom, s.left, o.top, o.left, height, width ):
        case isOver( s.bottom, s.right, o.top, o.left, height, width ):
          return true;
      }
      return false;
    }
    function getCorners( $el )
    {
      $el.offset = getTrueOffsets( $el );
  		return {
  		  top:    $el.offset.top,
  		  right:  $el.offset.left + $el.outerWidth(),
  		  bottom: $el.offset.top + $el.outerHeight(),
  		  left:   $el.offset.left  		  
  		};
    }
    function getTrueOffsets( $el )
    {
      $el.offset = $el.offset();
      return {
  			top: $el.offset.top + ( parseInt( $el.css('margin-left'), 10 ) || 0 ),
  			left: $el.offset.left + ( parseInt( $el.css('margin-top'), 10 ) || 0 )
  		};
    }
    function isOver( y, x, top, left, height, width )
  	{
      return isOverAxis( y, top, height ) && isOverAxis( x, left, width );
  	}
    function isOverAxis( x, reference, size )
    {
  		return ( x >= reference ) && ( x <= ( reference + size ) );
  	}
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
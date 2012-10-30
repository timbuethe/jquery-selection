/*
 * jQuery Selection
 * Version 1.0
 * https://github.com/timbuethe/jquery-selection
 */
;(function( $ ){

  var selected = [],
      settings,
      methods;

  function noop(){}

  /**
   * Default value implementation returns the index of the element.
   * @param element
   */
  function value(element){
    var $selectionContainer = $(element).closest('.selection'),
        $selectables = $selectionContainer.find(settings.filter);
    return $selectables.index(element);
  }

  function selectValuesBetween($selectables, value1, value2, groupRestriction){
    // console.debug('selectValuesBetween: ' + value1 + ' and ' + value2);

    var from = value1 < value2 ? value1 : value2,
        to   = value2 > value1 ? value2 : value1;

    selected = [];

    $selectables.each(function(){
      var val = settings.value(this),
          group = settings.group(this),
          select = (val >= from && val <= to && (!groupRestriction || groupRestriction === group)),
          $this = $(this);

      // fire select event
      if(!$this.hasClass('selection-selected') && select){
         settings.select(this);
      }

      // fire unselect event
      if($this.hasClass('selection-selected') && !select){
         settings.unselect(this);
      }

      $this.toggleClass('selection-selected', select)
           .toggleClass('selection-first', val === from)
           .toggleClass('selection-last', val === to);

      if(select) selected.push(this);
    });

    //console.debug('selectValuesBetween done. (selected: ' + selected.length + ')');
  }

  methods = {

    /**
     * Get the selected values
     */
    selectedValues : function() {
      var values = [];
      $(selected).each(function(){
        values.push(settings.value(this));
      });
      return values;
    },

    /**
     * true, if currently in selecting mode
     */
    isSelecting : function(){
      return this.data('selection-selecting') === true;
    },

    /**
     * Clear selection
     */
    clear : function(){
      return this.each(function() {
         var $selectionContainer = $(this),
            $selectables = $selectionContainer.find(settings.filter);

        selectValuesBetween($selectables);
      });
    },

    /**
     * Init
     * @param options
     */
    init : function( options ) {

      //console.debug('jQuery.selection init (' + this.length + ')');

      settings = $.extend( {
        'filter': '*',
        'start': noop,
        'stop': noop,
        'select': noop,
        'unselect': noop,
        'value': value,
        'group': noop
      }, options);

      return this.each(function() {

        var $selectionContainer = $(this),
            $selectables = $selectionContainer.find(settings.filter),
            firstSelectedValue,
            firstSelectedGroup;

        $selectionContainer.addClass('selection');
        $selectables.addClass('selection-selectable');

        /**
         * select
         */
        $selectionContainer.on('mouseenter', settings.filter, function(){
          if($selectionContainer.data('selection-selecting') === true){
            selectValuesBetween($selectables, firstSelectedValue, settings.value(this), firstSelectedGroup);
          }

          $(this).addClass('selection-over');
        });

        /**
         * unselect
         */
        $selectionContainer.on('mouseleave', settings.filter, function(){
          $(this).removeClass('selection-over');
        });

        /**
         * Start selection
         */
        $selectionContainer.on('mousedown', settings.filter, function(){
          settings.start(this);
          $selectionContainer.data('selection-selecting', true);
          firstSelectedValue = settings.value(this);
          firstSelectedGroup = settings.group(this);
        });

        /**
         * End selection
         */
        $(document).on('mouseup', function(){
          //console.debug('mouseup (' + $selectables.length + ')');
          if($selectionContainer.data('selection-selecting') === true){
            try {
              settings.stop(this, {elements: selected, values: methods.selectedValues()});
            } finally {
              $selectionContainer.data('selection-selecting', false);
            }
          }
        });

      });

    }
  };

  $.fn.selection = function( method ) {

    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.selection' );
    }

  };

})( jQuery );
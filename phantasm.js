//PhantasmAPI to work with phantasm node print server

// jQuery Plugin Boilerplate
// A boilerplate for jumpstarting jQuery plugins development
// version 1.1, May 14th, 2011
// by Stefan Gabos

// the semi-colon before the function invocation is a safety
// net against concatenated scripts and/or other plugins
// that are not closed properly.
; (function ($) {

    // undefined is used here as the undefined global
    // variable in ECMAScript 3 and is mutable (i.e. it can
    // be changed by someone else). undefined isn't really
    // being passed in so we can ensure that its value is
    // truly undefined. In ES5, undefined can no longer be
    // modified.

    // window and document are passed through as local
    // variables rather than as globals, because this (slightly)
    // quickens the resolution process and can be more
    // efficiently minified (especially when both are
    // regularly referenced in your plugin).

    $.Phantasm = function(element, url, options) {

        // this is private property and is  accessible only from inside the plugin
        var defaults = {
            layoutElements: { "map": true, "legend": true, "countryoverview": false, "accesspointsoverview": false, "bankingoverview": false, "tooloutput": false },
            imageFormat: 'png',
            sections: [] //hold the sections to be included in print
        };

        var id = 0;

        // to avoid confusions, use "plugin" to reference the 
        // current instance of the object
        var plugin = this;

	//The URL to the print template
        plugin.url = url; //TODO - validate that this was passed in

        // this will hold the merged default, and user-provided options
        // plugin's properties will be available through this object like:
        // plugin.settings.propertyName from inside the plugin or
        // element.data('pluginName').settings.propertyName from outside the plugin, 
        // where "element" is the element the plugin is attached to;
        plugin.settings = {}

        var $element = $(element), // reference to the jQuery version of DOM element
             element = element;    // reference to the actual DOM element

        plugin.element = $(element);

        // the "constructor" method that gets called when the object is created
        plugin.init = function () {

            // the plugin's final properties are the merged default and 
            // user-provided options (if any)
            plugin.settings = $.extend({}, defaults, options);

            // code goes here
            plugin._id = id;

            loadExportButtonHTML(plugin.element);

            connectRadioButtonOnClicks();

            $("#executeExportButton").on("click", function () {
                //Show loading gif. Hide export button
                try {
                    exportImage();
                }
                catch (e) {
                    showExportButtonHideLoader();
                }
            });
        }
    
        //show the export panel
        jQuery.fn.Phantasm.showExportOption = function (triggerNode) {
            //Position below the element used to initialize the plugin: TODO - this should be overwritten optionally by the user so they can place the popup wherever they want.
            //Get the element's left position
            if (!triggerNode) {
                triggerNode = plugin.element; //use the panel's parent if no trigger is passed in.
            }
            var element_position = $(triggerNode).offset();
            var left_center = element_position.left + ($(triggerNode).width() / 2); //find the left coordinate of the center of the element left + width/2

            //Use the left_center to center the exportOptions popup
            var left_popup = left_center - ($("#exportOptions").width() / 2); //subtract 1/2 the width of the popup
            $("#exportOptions").css({ "left": left_popup + "px" });


            //Do the top
            var top_popup = (element_position.top - 8);
            $("#exportOptions").css({ "top": top_popup + "px" });

            //Show panel
            $("#exportOptions").css({ "display": "block" });

        }

        //hide export panel
        jQuery.fn.Phantasm.hideExportOption = plugin.hideExportOption = function () {
            $("#exportOptions").css({ "display": "none" });
        }

        //Add section accepts a human readable name as well as a node object that contains the element to be included in print.
        //Options are selected - bool - should the item be seleccted by default?  Default is false
        jQuery.fn.Phantasm.addSection = function (name, node, options, callback) {
            if(!name){
                throw new Error();
            }

            try{
                //Mixin default options with passed in options.
                var default_section_options = { selected: false };
                var section_options = $.extend({}, default_section, options);

                //Add section object
                var section = { id: plugin._id++, title: name, node: node, options: options };

                //add to list
                sections.push(section);
            }
            catch(e){
                throw e;
            }
            finally{
                if(callback) callback(section); //call the callback (if specified) passing back the section object as an argument.
            }
        }

        var showWaitingPanel = function() {
            showLoader(); //show knightRider image, hide
            $("#exportOptionsPanel").css({ "display": "none" });
            $("#exportWaitingPanel").css({ "display": "block" });
            $(".exportGroupTitle.error").css({ "display": "none" }); //Hide error message, if shown
            $(".imageOpenButton").css({ "display": "none" }); //hide open image button
        }

        var hideWaitingPanel = function() {
            $("#exportWaitingPanel").css({ "display": "none" });
            $("#exportOptionsPanel").css({ "display": "block" });
        }

        var hideExportButtonShowLoader= function() {
            $("#executeExportButton").css({ "display": "none" });
            $(".knightRiderLoader").css({ "display": "block" });
        }

        var showExportButtonHideLoader = function() {
            $("#executeExportButton").css({ "display": "block" });
            $(".knightRiderLoader").css({ "display": "none" });
        }

        var loadExportButtonHTML = function (parentDivID) {

            var html =
            '<div id="exportOptions"><div id="exportTriangle"></div>' +
            '<div id="exportTitle">Export</div><div aria-hidden="true" class="icon-close-01" id="exportClose"></div>' +
            '<div id="exportOptionsPanel">' +
             '<div id="exportLayoutContainer" class="exportOptionsContainer clearfix">' +
              '<div class="exportGroupTitle">What element(s) would you like to include in the exported image?</div>' +
              '<div class="exportOptionsGroup">' +
               '<table>' +
                '<tr>' +
                 '<td><div id="optionalOutputMap" class="checkbox checked"></div></td>' +
                 '<td>Map</td>' +
                 //'<td><div id="optionalOutputToolOutput" class="checkbox"></div>' +
                 //'<td>Tool Output</td>' +
                '</tr>' +

                '<tr>' +
                 '<td><div id="optionalOutputLegend" class="checkbox checked"></div></td>' +
                 '<td>Legend</td>' +
                 //'<td><div id="optionalOutputBankingOverview" class="checkbox bankingOverview"></div>' +
                 //'<td><div class="bankingOverview">Banking Overview</div></td>' +
                '</tr>' +

                '<tr>' +
                 //'<td><div id="optionalOutputCountryOverview" class="checkbox"></div>' +
                 //'<td>Country Overview</td>' +
                 //'<td><div id="optionalOutputAccessPointsPanel" class="checkbox"></div>' +
                 //'<td><div class="">Access Points Overview</div></td>' +
                '</tr>' +
               '</table>' +
              '</div>' +
             '</div>' + //End of exportLayoutContainer dev
             '<div id="exportOptionsContainer" class="exportOptionsContainer clearfix">' +
              '<div class="exportOptionsGroup">' +
               '<div class="exportGroupTitle">Image format:</div>' +
               '<table>' +
                '<tr>' +
                 '<td><div id="pngImageFormat" class="exportRadioButtonUnselected exportRadioButtonSelected"></div></td>' +
                 '<td>png</td>' +
                '</tr>' +
                //'<tr>' +
                // '<td><div id="pdfImageFormat" class="exportRadioButtonUnselected"></div></td>' +
                // '<td>pdf</td>' +
                //'</tr>' +
               '</table>' +
              '</div>' +
             '</div>' + //end of exportOptionsContainer
             '<div id="executeExportButton">EXPORT</div>' +
             '</div>' + //end of exportOptionsPanel
             '<div id="exportWaitingPanel" style="display:none;">' + 
             '<div class="knightRiderLoader" style="display:none;"></div><div class="imageOpenButton" style="display:none;"><div style="text-align: left;margin-top: 26px;">Image rendering complete.  Click \'Open Image\' to view the image in a new tab, or click \'Reset\' to return to the export window.</div><div style="margin-top:30px;"><a href="" target="_blank">Open Image</a><span class="killOpenButton">Reset</span></div></div><div id="exportMessage" style="font-size: 11px;float: left;margin-top: 16px;"></div>' +
             '</div>' + //end of exportWaitingPanel
            '</div>';
            $(html).appendTo($(parentDivID));
        }

        var  connectRadioButtonOnClicks =function() {


            $("#optionalOutputMap").on("click", getLayoutElementOnClick('map'));
            $("#optionalOutputLegend").on("click", getLayoutElementOnClick('legend'));
            $("#optionalOutputCountryOverview").on("click", getLayoutElementOnClick('countryoverview'));
            $("#optionalOutputAccessPointsPanel").on("click", getLayoutElementOnClick('accesspointsoverview'));
            $("#optionalOutputBankingOverview").on("click", getLayoutElementOnClick('bankingoverview'));
            $("#optionalOutputToolOutput").on("click", getLayoutElementOnClick('tooloutput'));

            var pngRBNode = $("#pngImageFormat");
            pngRBNode.on("click", getImageButtonRadioButtonOnClick(pngRBNode, 'png'));

            var pdfRBNode = $("#pdfImageFormat");
            pdfRBNode.on("click", getImageButtonRadioButtonOnClick(pdfRBNode, 'pdf'));

            $("#exportClose").on("click", plugin.hideExportOption);

            $(".killOpenButton").on("click", hideWaitingPanel); //the discard button

        }

        var getImageButtonRadioButtonOnClick= function (node, imageFormat) {

            return function () {
                plugin._ImageFormat = imageFormat;
                removeAllSelectedRadioButtons("exportOptionsContainer");
                node.addClass("exportRadioButtonSelected");
            };
        }

        var getLayoutElementOnClick = function (element) {
            return function () {
                //Toggle Active State
                plugin.settings.layoutElements[element] = !plugin.settings.layoutElements[element];

                //$("#exportOptions .checkbox").removeClass("checked");
                $(this).toggleClass('checked');
            };
        }

        var removeAllSelectedRadioButtons = function (parentDivID) {
            $.each($("#" + parentDivID + " .exportRadioButtonSelected"), function (idx, node) {
                $(node).removeClass("exportRadioButtonSelected");
            });
        }

        var hideLoader= function() {
            $(".knightRiderLoader").css({ "display": "none" });
        }

        var showLoader= function() {
            $(".knightRiderLoader").css({ "display": "block" });
        }

        var killOpenImageButton= function() {
            //Hide 'open image' button and show export button.
            showExportButtonHideLoader();
            $(".imageOpenButton").css({ "display": "none" });
        }

        var onError = function() {
            plugin._hideWaitingPanel();
            //Display error message.
            $(".exportGroupTitle.error").replace("<span>There was an error exporting the image.</span>");
            $(".exportGroupTitle.error").css({ "display": "block" });
        }

        var exportImage= function() {

            var titleHTML = "Title";
            //var legendsHTML = $('<div>').append($("#LayerListWrapper").clone()).html().replace(/\"/g, '\\"');

            var layoutWidth = $("body").width();
            var mapHeight = $("#mapDiv").height();
            var mapWidth = $("#mapDiv").width();

            var codeblock = "";
            //Adjust body width
            codeblock += '$("body").width(' + (mapWidth) + ');';

            //Label selected country
            codeblock += '$("#activeCountry").html( "");';

            //Depending on what's in the layoutElements array, grab dom nodes
            var _showNone = true; //flag to detect if user chose nothing

            for (var key in plugin.settings.layoutElements) {
                if (plugin.settings.layoutElements.hasOwnProperty(key)) {
                    //If user has selected even 1 element, then set _showNone to false; (because we are going to show something)
                    if (plugin.settings.layoutElements[key] === true) {
                        _showNone = false;
                    }
                    switch (key) {
                        case "map":
                            if (plugin.settings.layoutElements[key] === true) {
                                //grab the map div
                                var mapHTML = $('<div>').append($(".leaflet-map-pane").clone()).html().replace(/\"/g, '\\"');
                                if (mapHTML.indexOf('-webkit-transform') === -1) {
                                    mapHTML = mapHTML.replace(/-ms-transform/g, 'transform').replace(/transform/g, '-webkit-transform');
                                }
                                codeblock += '$("#mapDiv").height(' + mapHeight + ');';
                                codeblock += '$("#mapDiv").replaceWith("' + mapHTML + '");';
                                //Adjust Map wrapper
                                codeblock += '$("#upperMapWrapper").width(' + (mapWidth) + ');';
                                codeblock += '$("#upperMapWrapper").height(' + (mapHeight) + ');';
                                codeblock += '$("#upperMapWrapper").show();';

                            }
                            else {
                                //hide map div
                                codeblock += '$("#mapDiv").hide();';
                            }
                            break;

                        case "legend":
                            if (plugin.settings.layoutElements[key] === true) {
                                var legendsHTML = $('<div>').append($("#legend").clone()).html().replace(/\"/g, '\\"');
                                codeblock += "$('#legends').append('" + legendsHTML + "');";
                            }
                            else {
                                //if both map and legend are excluded, hide the wrapper with border
                                if (plugin.settings.layoutElements["map"] != true) {
                                    codeblock += '$("#upperMapWrapper").css({"display": "none"});';
                                }
                            }
                            break;

                    }
                }
            }

            if (_showNone == true) {
                //Don't do anything, cause user hasn't selected anything.
                $("#exportMessage").html("Please select 1 or more elements to export.");
                return;
            }
            else {
                $("#exportMessage").html("");
            }

            //show loader
            showWaitingPanel();

            //formatting
            codeblock = codeblock.replace(/(\r\n|\n|\r)/gm, "");  //remove line breaks

            var printPostArgs = {
                url: plugin.url,
                imageformat: plugin._ImageFormat || 'png',
                format: 'json',
                codeblock: codeblock,
                viewportheight: mapHeight,
                viewportwidth: layoutWidth
            };


            $.ajax({
                type: "POST",
                url: 'http://services.spatialdev.com/print',
                data: printPostArgs,
                success: onImageExport,
                error: onError
            });

        }

        var onImageExport = function (result) {

            var exportImageURL = result.image;

            //instead, show a button/hyperlink for the user to open the image.
            $(".imageOpenButton a").attr("href", exportImageURL);
            $(".imageOpenButton").css({ "display": "block" });

            //Hide loader
            hideLoader();
        }

        plugin.init();
    }

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn.Phantasm = function (options) {
        return this.each(function() {
            if (undefined == $(this).data('Phantasm')) {
                var plugin = new $.Phantasm(this, options);
                $(this).data('Phantasm', plugin);
            }
        });
    }

})(jQuery);

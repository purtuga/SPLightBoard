define([
    "text!./main.html",
    "jquery",
    "vendor/SPWidgets/src/boardWidget/board",
    "vendor/SPWidgets/src/spapi/getSiteListCollection",
    "vendor/SPWidgets/src/spapi/getListColumns",
    // -modules not needing a reference----------
    "less!../styles/common",
    "jquery-ui"
], function(
    template,
    $,
    board,
    getSiteListCollection,
    getListColumns
){

    var
    inst = {},
    /**
     * Apps main module
     * @namespace main
     */
    main = /** @lends main */{

        /**
         * Starts the app.
         * @param {HTMLElement} appCntrEle
         *      The HTMl element where the app should live
         *
         * @param {HTMLElement} overlayEle
         *      The overlay (ui blocker) for the app.
         */
        start: function(appCntrEle, overlayEle){

            inst.$appCntr = $(appCntrEle).html(template);
            setupMenu();
            overlayEle.style.display = "none";

        }

    }, //end: main

    setupMenu = function(){

        var
        $lists  = inst.$appCntr.find("div.light-board-menu-lists > select"),
        $fields = inst.$appCntr.find("div.light-board-menu-columns > select"),
        $kanban = inst.$appCntr.find("div.light-board-kanban");

        getSiteListCollection()
        .then(function(siteLists){

            var listOptions = siteLists.reduce(function(optionsHtml, list){
                optionsHtml += '<option value="' + list.InternalName + '">' + list.Title + '</option>';
                return optionsHtml;
            }, '<option value="">Select List...</option>');

            $lists.html(listOptions);

            $lists.on("change", function(){

                $fields.html('<option value="">Pick List First</option>');
                $kanban.empty();

                if (!$lists.val()) {
                    return;
                }

                getListColumns({listName: $lists.val()})
                .then(function(listColumns){
                    var colOptions = listColumns.reduce(function(html, column){
                        if (column.Type === "Lookup" || column.Type === "Choice") {
                            html += '<option value="' + column.StaticName + '">' + column.DisplayName + '</option>';
                        }
                        return html;
                    }, '<option value="">Select Column...</option>');
                    $fields.html(colOptions);
                });

            });

            $fields.on("change", function(){

                if (!$fields.val()) {
                    return;
                }

                board(
                    $("<div/>").appendTo($kanban.empty()),
                    {
                        list:   $lists.val(),
                        field:  $fields.val()
                    }
                );

            });

        });

    };

    return main;

});
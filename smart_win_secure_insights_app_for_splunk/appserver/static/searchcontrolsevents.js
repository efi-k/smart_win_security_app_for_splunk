require([
    "jquery",
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/searchbarview",
    "splunkjs/mvc/searchcontrolsview",
    "splunkjs/mvc/simplexml/ready!"
], function(
    $,
    mvc,
    SearchManager,
    SearchbarView,
    SearchControlsView
) {

    var tokens = mvc.Components.get("default");

    // Button to open the train models dashboard
    $('#trainModels').on('click', function (e) {
      var href=window.location.href;
      var protocol=window.location.protocol;
      var href_split=href.split("/");
      var host=href_split[2]+"/"+href_split[3]+"/"+href_split[4]+"/"+href_split[5]+"/";
      var defaultTokenModelun = mvc.Components.getInstance('default', { create: true });

      var target = protocol + "//" + host + "train_clustering_models?search="
            + encodeURIComponent(defaultTokenModelun.get("searchString"))
            + "&index=" + defaultTokenModelun.get("index")
            + "&form.time.earliest=" + defaultTokenModelun.get("form.time.earliest")
            + "&form.time.latest=" + defaultTokenModelun.get("form.time.latest");

      window.open(target);
    });

    // Create the search manager
    var mysearch = new SearchManager({
        id: "base",
        preview: true,
        cache: true,
        status_buckets: 300,
        required_field_list: "*",
        search: ''
    });

    var mysearchbar = new SearchbarView ({
        id: "searchbar1",
        managerid: "base",
        timerange: false,
        el: $("#mysearchbar1")
    }).render();

    var mysearchcontrols = new SearchControlsView ({
        id: "searchcontrols1",
        managerid: "base",
        el: $("#mysearchcontrols1")
    }).render();

    // When the query in the searchbar changes, update the search manager
    mysearchbar.on("change", function() {
        mysearch.settings.unset("search");
        mysearch.settings.set("search", mysearchbar.val());

        // set token value with search string
        var searchString = mysearchbar.val();

        //Collect tokens from the dashboard
        function setToken(name, value) {
          defaultTokenModelun.set(name, value);
          submittedTokenModelun.set(name, value);
        }
        function unsetToken(name) {
          defaultTokenModelun.unset(name);
          submittedTokenModelun.unset(name);
        }
        var defaultTokenModelun = mvc.Components.getInstance('default', { create: true });
        var submittedTokenModelun = mvc.Components.getInstance('submitted', { create: true });

        //Show the edit panel
        setToken("searchString",searchString);

        // Hide the text panel
        unsetToken("beforeSearch");

        //setToken("earliest",mysearch.settings.attributes.earliest_time);
        //setToken("latest",mysearch.settings.attributes.latest_time);

        //console.log("Eariest time: " + defaultTokenModelun.get("earliest"));
        //console.log("Latest time: " + defaultTokenModelun.get("latest"));
        console.log(defaultTokenModelun.get("searchString"));
    });

    // When the timerange in the searchbar changes, update the search manager
    mysearchbar.timerange.on("change", function() {
        mysearch.settings.set(mysearchbar.timerange.val());
    });


    $('#enterSearch').on("click", function (e){
      var defaultTokenModelun = mvc.Components.getInstance('default', { create: true });
      var index=defaultTokenModelun.get("index");
      var earliest=defaultTokenModelun.get("form.time.earliest");
      var latest=defaultTokenModelun.get("form.time.latest");

      mysearchbar.val("index=" + index + " source=\"*WinEventLog:Security\" earliest=" +  earliest + " latest=" + latest +"\r\n| bin _time span=1h\r\n| eval key=host.\"|\".user.\"|\".EventCode\r\n| stats count by _time key \r\n| makemv key delim=\"|\"\r\n| eval DayOfWeek=strftime(_time,\"%a\"), host=mvindex(key,0), user=mvindex(key,1), EventCode=mvindex(key,2)\r\n| eval key=mvjoin(key, \"|\")");
    });
});

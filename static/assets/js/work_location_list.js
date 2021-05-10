var lat1 = $('#wlatitude').val();
        var long1= $('#wlongitude').val();
        document.onfullscreenchange = function (event) {
            let target = event.target;
            let pacContainerElements = document.getElementsByClassName("pac-container");
            if (pacContainerElements.length > 0) {
                let pacContainer = document.getElementsByClassName("pac-container")[0];
                if (pacContainer.parentElement === target) {
                    console.log("Exiting FULL SCREEN - moving pacContainer to body");
                    document.getElementsByTagName("body")[0].appendChild(pacContainer);
                } else {
                    console.log("Entering FULL SCREEN - moving pacContainer to target element");
                    target.appendChild(pacContainer);
                }
            } else {
                console.log("FULL SCREEN change - no pacContainer found");

            }
        };

        function editWorkDetails(id){
        console.log('id',id);
        $('#work_edit_id').val(id);
        $.ajax({
            // url : "{% url 'face_auth:getworkbyid' %}?id="+id,
            url : "/api/getworkbyid?id="+id,
            type:'get',
            success: function(data){
                console.log(data);
                $('#wname').val(data.data.name);
                $('#wlocation_code').val(data.data.location_code);
                $('#wgeo_fence').val(data.data.radius);
                $('#waddress').val(data.data.address);
                $('#wlatitude').val(data.data.lat);
                $('#wlongitude').val(data.data.long);
                $('#witl').val(data.data.is_temporary);
                $('#wfrom').val(data.data.from);
                $('#wto').val(data.data.to);
                $('#wuserwork').val(data.data.work).trigger('change');
                var lat = $('#wlatitude').val(data.data.lat);
                var long = $('#wlongitude').val(data.data.long);
                var editlat = parseFloat(data.data.lat);
                var editlong = parseFloat(data.data.long);
                console.log(editlong,editlat);

                const map1 = new google.maps.Map(document.getElementById("wmap1"), {
                    center: {
                        lat: 20.5937,
                        lng: 78.9629
                    },
                    zoom: 5,
                    mapTypeId: "roadmap"
                }); // Create the search box and link it to the UI element.

                navigator.geolocation.getCurrentPosition(function (position) {
                    var pos = {
                        lat: editlat,
                        lng: editlong
                    };
                    infoWindow1.setPosition(pos);
                    infoWindow1.setContent('You are here:<br>Lat: ' + pos.lat + '<br>Long: ' + pos.lng);
                    marker1 = new google.maps.Marker({
                        position: pos,
                        map: map1
                    });
                    infoWindow1.open(map1, marker1);
                    map1.setCenter(pos);
                    $("#wlatitude").val(pos.lat); // The latitude form input (it actually has an ID)
                    $("#wlongitude").val(pos.lng); // The longitude input (No id LOL)

                }, function () {
                    handleLocationError(true, infoWindow1, map1.getCenter());
                });

                google.maps.event.addListener(map1, "click", function (e) {
                latLng = e.latLng;

                $("#wlatitude").val(e.latLng.lat());
                $("#wlongitude").val(e.latLng.lng());

                // if marker exists and has a .setMap method, hide it
                if (marker1 && marker1.setMap) {
                    marker1.setMap(null);
                }
                marker1 = new google.maps.Marker({
                    position: latLng,
                    map1: map1
                });
                infoWindow1.setPosition(latLng);
                infoWindow1.setContent('You have selected:<br>Lat: ' + e.latLng.lat() + '<br>Long: ' + e.latLng.lng());
                infoWindow1.open(map1, marker1);
            });

                
                
            },
            error: function(jqXhr, textStatus, errorThrown){
                console.log("some error " + String(errorThrown) + String(textStatus) + String(XMLHttpRequest.responseText));
                console.log(errorThrown);
            },
        });
        $('#editwork').modal().show();

    };

        $(document).ready(function () {
            console.log("ready");
            $('#employee').on('change', function() {
                if ( this.value == 'all')
              {
                $("#empdate").show();
              }
              else
              {
                $("#showwmp").show();
                $("#empdate").show();
              }
            });

            $('#wemployee').on('change', function() {
                if ( this.value == 'all')
              {
                $("#wempdate").show();
              }
              else
              {
                $("#wshowwmp").show();
                $("#wempdate").show();
              }
            });
        });
        var map;
        var marker;
        var map1;
        var marker1;

        function initAutocomplete() {
            const map = new google.maps.Map(document.getElementById("map1"), {
                center: {
                    lat: 20.5937,
                    lng: 78.9629
                },
                zoom: 5,
                mapTypeId: "roadmap"
            }); // Create the search box and link it to the UI element.

            const map1 = new google.maps.Map(document.getElementById("wmap1"), {
                center: {
                    lat: 20.5937,
                    lng: 78.9629
                },
                zoom: 5,
                mapTypeId: "roadmap"
            }); // Create the search box and link it to the UI element.

            const input = document.getElementById("pac-input");
            const searchBox = new google.maps.places.SearchBox(input);
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(input); // Bias the SearchBox results towards current map's viewport.

            map.addListener("bounds_changed", () => {
                searchBox.setBounds(map.getBounds());
            });

            const input2 = document.getElementById("wpac-input");
            const searchBox2 = new google.maps.places.SearchBox(input2);
            map1.controls[google.maps.ControlPosition.TOP_LEFT].push(input2); // Bias the SearchBox results towards current map's viewport.

            map1.addListener("bounds_changed", () => {
                searchBox2.setBounds(map1.getBounds());
            });

            let markers = []; // Listen for the event fired when the user selects a prediction and retrieve
            // more details for that place.
            infoWindow = new google.maps.InfoWindow;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    infoWindow.setPosition(pos);
                    infoWindow.setContent('You are here:<br>Lat: ' + pos.lat + '<br>Long: ' + pos.lng);
                    marker = new google.maps.Marker({
                        position: pos,
                        map: map
                    });
                    infoWindow.open(map, marker);
                    map.setCenter(pos);
                    $("#latitude").val(pos.lat); // The latitude form input (it actually has an ID)
                    $("#longitude").val(pos.lng); // The longitude input (No id LOL)

                }, function () {
                    handleLocationError(true, infoWindow, map.getCenter());
                });
            } else {
                // Browser doesn't support Geolocation
                handleLocationError(false, infoWindow, map.getCenter());
            }
            google.maps.event.addListener(map, "click", function (e) {
                latLng = e.latLng;

                $("#latitude").val(e.latLng.lat());
                $("#longitude").val(e.latLng.lng());

                // if marker exists and has a .setMap method, hide it
                if (marker && marker.setMap) {
                    marker.setMap(null);
                }
                marker = new google.maps.Marker({
                    position: latLng,
                    map: map
                });
                infoWindow.setPosition(latLng);
                infoWindow.setContent('You have selected:<br>Lat: ' + e.latLng.lat() + '<br>Long: ' + e.latLng.lng());
                infoWindow.open(map, marker);
            });

            searchBox.addListener("places_changed", () => {
                const places = searchBox.getPlaces();

                if (places.length == 0) {
                    return;
                } // Clear out the old markers.

                markers.forEach(marker => {
                    marker.setMap(null);
                });
                markers = []; // For each place, get the icon, name and location.

                const bounds = new google.maps.LatLngBounds();
                places.forEach(place => {
                    if (!place.geometry) {
                        console.log("Returned place contains no geometry");
                        return;
                    }

                    const icon = {
                        url: place.icon,
                        size: new google.maps.Size(71, 71),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(17, 34),
                        scaledSize: new google.maps.Size(25, 25)
                    }; // Create a marker for each place.

                    markers.push(
                        new google.maps.Marker({
                            map,
                            icon,
                            title: place.name,
                            position: place.geometry.location
                        })
                    );

                    if (place.geometry.viewport) {
                        // Only geocodes have viewport.
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                });
                map.fitBounds(bounds);
            });


            let markers1 = []; // Listen for the event fired when the user selects a prediction and retrieve
            // more details for that place.
            infoWindow1 = new google.maps.InfoWindow;
            if (navigator.geolocation) {
                
            } else {
                // Browser doesn't support Geolocation
                handleLocationError(false, infoWindow1, map1.getCenter());
            }
            
            searchBox2.addListener("places_changed", () => {
                const places = searchBox2.getPlaces();

                if (places.length == 0) {
                    return;
                } // Clear out the old markers.

                markers1.forEach(marker => {
                    marker1.setMap(null);
                });
                markers1 = []; // For each place, get the icon, name and location.

                const bounds = new google.maps.LatLngBounds();
                places.forEach(place => {
                    if (!place.geometry) {
                        console.log("Returned place contains no geometry");
                        return;
                    }

                    const icon = {
                        url: place.icon,
                        size: new google.maps.Size(71, 71),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(17, 34),
                        scaledSize: new google.maps.Size(25, 25)
                    }; // Create a marker for each place.

                    markers1.push(
                        new google.maps.Marker({
                            map1,
                            icon,
                            title: place.name,
                            position: place.geometry.location
                        })
                    );

                    if (place.geometry.viewport) {
                        // Only geocodes have viewport.
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                });
                map1.fitBounds(bounds);
            });
        }

        function handleLocationError(browserHasGeolocation, infoWindow, pos) {
            infoWindow.setPosition(pos);
            infoWindow.setContent(browserHasGeolocation ?
                'Error: The Geolocation service failed.' :
                'Error: Your browser doesn\'t support geolocation.');
            infoWindow.open(map);
            infoWindow1.setPosition(pos);
            infoWindow1.setContent(browserHasGeolocation ?
                'Error: The Geolocation service failed.' :
                'Error: Your browser doesn\'t support geolocation.');
            infoWindow1.open(map1);
        }
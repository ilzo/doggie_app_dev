var markers = [];
var sidebarItem; 
var latLngList = [];
var markerID = 0;
var serviceMapMatches = [];
var radarArray = [];
var detailsArray = [];
var searchedCategories = [];
var serviceCategories = [];

$( document ).ready(function() {
    
/*
$( "#search-box" ).autocomplete({
  source: searchArray
});
*/
    
    var searchInput = $("#input-data").data("id");
    
    var locationInput = $("#location-data").data("id");
    
    var radiusInput = $("#radius-data").data("id");
    
    $("#search-data-container").find('.categories-data').each(function(){
        serviceCategories.push($(this).data("id"));
    });
    
    if(serviceCategories.length > 0) {
      
        console.log(serviceCategories);
        var time = 200;
        $.each( serviceCategories, function( i, val ) {

        setTimeout( function(){ 

                if(val === 'pet_store') {
                    performRadarSearchByCategory('pet_store', searchInput, locationInput, radiusInput);

                }else if(val === 'veterinary_care') {
                    performRadarSearchByCategory('veterinary_care', searchInput, locationInput, radiusInput);

                }else if(val === 'dog_park'){
                    searchFromServiceMap(searchInput, locationInput, radiusInput);

                }else if(val === 'dog_trainer'){
                    performRadarSearchByTerms(searchInput, 'Koirankouluttaja', locationInput, radiusInput);
                }

            }, time);

            time += 1000;


        });
      
    }else{
        
        if(searchInput){
            searchFromServiceMap(searchInput, locationInput, radiusInput);
            performRadarSearchByTerms(searchInput, null, locationInput, radiusInput);
        }else{
            console.log("Error: No search terms given!");
        }
          
    }
  

});

function performRadarSearchByCategory(category, terms, location, radius) {

    if($.inArray(category, searchedCategories) == -1) {

        console.log("category " + category + " was not found in searchedCategories");
        
        //If user has specified a location for search, the address has to be geocoded into LatLng-object
        //and placed as a location property into arraySearch request
        if(location) {
            
            geocoder.geocode( { 'address': location}, function(results, status) {
              if (status == 'OK') {
                //var geocodeResult = results[0].geometry.location;
                //console.log("geocodeResult:");
                
                var testLat = parseFloat(results[0].geometry.location.lat()).toFixed(5);
                var testLng = parseFloat(results[0].geometry.location.lng()).toFixed(5);
                 
                if(category && terms && radius){
                
                    var request = {
                        key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                        keyword: terms,
                        location: results[0].geometry.location,
                        radius: radius,
                        type: [category]
                    };
                }else if (category && !terms && radius) {
                    
                    var request = {
                        key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                        location: results[0].geometry.location,
                        radius: radius,
                        type: [category]
                    };
                    
                    
                }else if (category && terms && !radius){
                    var request = {
                        key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                        keyword: terms,
                        location: results[0].geometry.location,
                        radius: '20000',
                        type: [category]
                    };
                    

                }else if (category && !terms && !radius){
                    var request = {
                        key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                        location: results[0].geometry.location,
                        radius: '20000',
                        type: [category]
                    };

                }
                  
                placesService.radarSearch(request, processRadarResults);
                
              } else {
                alert('Geocode was not successful for the following reason: ' + status);
              }
              
            });
            
            
            
            
            
        }else{
            
            if(category && terms && radius){
                var request = {
                    key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                    keyword: terms,
                    location: new google.maps.LatLng(60.192059, 24.945831),
                    radius: radius,
                    type: [category]
                };
            }else if (category && !terms && radius) {
                var request = {
                    key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                    location: new google.maps.LatLng(60.192059, 24.945831),
                    radius: radius,
                    type: [category]
                };
                
            }else if (category && terms && !radius){
                var request = {
                    key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                    keyword: terms,
                    location: new google.maps.LatLng(60.192059, 24.945831),
                    radius: '20000',
                    type: [category]
                };

            }else if (category && !terms && !radius){
                 var request = {
                    key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                    location: new google.maps.LatLng(60.192059, 24.945831),
                    radius: '20000',
                    type: [category]
                };

            }
            
             placesService.radarSearch(request, processRadarResults);
              
        }

        searchedCategories.push(category);
        
    }else{

        console.log("category " + category + " has already been searched");
        processRadarArray();   

    }  

}

function performRadarSearchByTerms(terms, extraArg, location, radius) {
    
    if(location) {
        
        geocoder.geocode( { 'address': location}, function(results, status) {
              if (status == 'OK') {
                  
                  //THE AMOUNT OF IF-ELSES AND REPEATED CODE IS RIDICULOUS, HAS TO BE REFACTORED!
                  if(terms && !extraArg && radius) {
                      
                        var request = {
                            key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                            keyword: terms,
                            location: results[0].geometry.location,
                            radius: radius,
                        };

                    }else if(terms && extraArg && radius){
                        var request = {
                            key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                            keyword: extraArg + ' ' + terms,
                            location: results[0].geometry.location,
                            radius: radius,
                        };
                        
                    }else if(terms && extraArg && !radius){
                        var request = {
                            key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                            keyword: extraArg + ' ' + terms,
                            location: results[0].geometry.location,
                            radius: '1500',
                        };

                    }else if (!terms && extraArg && radius){
                         var request = {
                            key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                            keyword: extraArg,
                            location: results[0].geometry.location,
                            radius: radius,
                        };
                    }else if (terms && !extraArg && !radius) {
                        var request = {
                            key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                            keyword: terms,
                            location: results[0].geometry.location,
                            radius: '1500',
                        };
                    }else if (!terms && extraArg && !radius) {
                        var request = {
                            key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                            keyword: extraArg,
                            location: results[0].geometry.location,
                            radius: '1500',
                        };
                    }

                placesService.radarSearch(request, processRadarResults);
                
                  
              } else {
                alert('Geocode was not successful for the following reason: ' + status);
              }
              
            });
        
    }else{
        
          //THE AMOUNT OF IF-ELSES AND REPEATED CODE IS RIDICULOUS, HAS TO BE REFACTORED!
          if(terms && !extraArg && radius) {
                var request = {
                    key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                    keyword: terms,
                    location: new google.maps.LatLng(60.192059, 24.945831),
                    radius: radius,
                };

            }else if(terms && extraArg && radius){
                var request = {
                    key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                    keyword: extraArg + ' ' + terms,
                    location: new google.maps.LatLng(60.192059, 24.945831),
                    radius: radius,
                };

            }else if(terms && extraArg && !radius){
                var request = {
                    key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                    keyword: extraArg + ' ' + terms,
                    location: new google.maps.LatLng(60.192059, 24.945831),
                    radius: '20000',
                };

            }else if (!terms && extraArg && radius){
                 var request = {
                    key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                    keyword: extraArg,
                    location: new google.maps.LatLng(60.192059, 24.945831),
                    radius: radius,
                };
            }else if (terms && !extraArg && !radius) {
                var request = {
                    key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                    keyword: terms,
                    location: new google.maps.LatLng(60.192059, 24.945831),
                    radius: '20000',
                };
            }else if (!terms && extraArg && !radius) {
                var request = {
                    key: 'AIzaSyAZ3ZAumNn6WnyDSf7XbiZi5WhZC6foPCs',
                    keyword: extraArg,
                    location: new google.maps.LatLng(60.192059, 24.945831),
                    radius: '20000',
                };
            }

        placesService.radarSearch(request, processRadarResults);
        
        
    }
    
    
        
}


function searchFromServiceMap(input, location, radius){
    
    if(location) {
        
        geocoder.geocode( { 'address': location}, function(results, status) {
                  if (status == 'OK') {
                    //var geocodeResult = results[0].geometry.location;
                    //console.log("geocodeResult:");

                    var serviceMapLat = parseFloat(results[0].geometry.location.lat()).toFixed(5);
                    var serviceMapLng = parseFloat(results[0].geometry.location.lng()).toFixed(5);
                      
                      
                    if (input && radius) {
                        var convertedInput = input.replace(/ /gi, "+").replace(/ä/gi, "%E4").replace(/ö/gi, "%F6");
                        
                        $.ajax({
                              url: 'http://www.hel.fi/palvelukarttaws/rest/v2/unit/?search='+convertedInput+'&lat='+serviceMapLat+'&lon='+serviceMapLng+'&distance='+radius+'',
                              dataType: 'jsonp',
                              'success': processServiceMapResults  
                        });

                    }else if (!input && radius) {
                        $.ajax({
                              url: 'http://www.hel.fi/palvelukarttaws/rest/v2/unit/?search=Koira-alueet&lat='+serviceMapLat+'&lon='+serviceMapLng+'&distance='+radius+'',
                              dataType: 'jsonp',
                              'success': processServiceMapResults  
                        });

                    }else if (input && !radius) {
                        
                        var convertedInput = input.replace(/ /gi, "+").replace(/ä/gi, "%E4").replace(/ö/gi, "%F6");

                        $.ajax({
                              url: 'http://www.hel.fi/palvelukarttaws/rest/v2/unit/?search='+convertedInput+'&lat='+serviceMapLat+'&lon='+serviceMapLng+'&distance=1000',
                              dataType: 'jsonp',
                              'success': processServiceMapResults  
                        });
                        
                        
                    }else{
                        $.ajax({
                              url: 'http://www.hel.fi/palvelukarttaws/rest/v2/unit/?search=Koira-alueet&lat='+serviceMapLat+'&lon='+serviceMapLng+'&distance=1000',
                              dataType: 'jsonp',
                              'success': processServiceMapResults  
                        });
                        
                    }



                  } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                  }
              
            });
        
    }else{
        
        var helsinkiLat = '60.19206';
        var helsinkiLng = '24.94583';
            
        if (input && radius) {
            
            var convertedInput = input.replace(/ /gi, "+").replace(/ä/gi, "%E4").replace(/ö/gi, "%F6");

            $.ajax({
                  url: 'http://www.hel.fi/palvelukarttaws/rest/v2/unit/?search='+convertedInput+'&lat='+helsinkiLat+'&lon='+helsinkiLng+'&distance='+radius+'',
                  dataType: 'jsonp',
                  'success': processServiceMapResults  
            });

        }else if (!input && radius) {
            $.ajax({
                  url: 'http://www.hel.fi/palvelukarttaws/rest/v2/unit/?search=Koira-alueet&lat='+helsinkiLat+'&lon='+helsinkiLng+'&distance='+radius+'',
                  dataType: 'jsonp',
                  'success': processServiceMapResults  
            });

        }else if (input && !radius) {

            var convertedInput = input.replace(/ /gi, "+").replace(/ä/gi, "%E4").replace(/ö/gi, "%F6");

            $.ajax({
                  url: 'http://www.hel.fi/palvelukarttaws/rest/v2/unit/?search='+convertedInput+'',
                  dataType: 'jsonp',
                  'success': processServiceMapResults  
            });


        }else{
            $.ajax({
                  url: 'http://www.hel.fi/palvelukarttaws/rest/v2/unit/?search=Koira-alueet',
                  dataType: 'jsonp',
                  'success': processServiceMapResults  
            });

        } 
        
        
        
        
    }
    
               
}



function processRadarResults(results, status) {
    if (status !== google.maps.places.PlacesServiceStatus.OK) {
    console.error(status);
    return;
    }
    
    
    $("#sidebar-content-wrapper").empty();
    console.log(results);

    if(markers.length > 0){
        markers.forEach(markerRemover);
        markers = [];
        latLngList = [];
        markerID = 0;
        //radarArray = [];
    } 

    for (var i = 0, result; result = results[i]; i++) {
      radarArray.push(result);
    }
    
    
    for(var i = 0; i < 8; i++) {
        
        if(radarArray[i]){

        if (detailsArray.filter(function(e) { return e.place_id == radarArray[i].place_id; }).length == 0) {
            
            
                var detailsRequest = {
                    placeId: radarArray[i].place_id
                }
            
                placesService.getDetails(detailsRequest, detailsCallback);
                
        
        }else{
            
            console.log("PLACE IS ALREADY IN DETAILS ARRAY");
            populateMap(detailsArray[i]);
        }
            
        }else{
            console.log("radarArray has less than 8 objects");
            break;
        } 

    }


    if(results.length > 0) {
        $('#places-show-more').unbind( "click" );
        $('#places-show-more').unbind( "dblclick" );
        $('#places-show-more').css('display', 'block').bind( "click", getNextPlaces).dblclick(function(e){
          console.log("double-clicked but did nothing");
          e.stopPropagation();
          e.preventDefault();
          return false;
        });
    }

    console.log("radarArray:"); 
    console.log(radarArray);
    
}


function processRadarArray() {
    //$("#sidebar-content-wrapper").empty();


    if(markers.length > 0){
        markers.forEach(markerRemover);
        markers = [];
        latLngList = [];
        markerID = 0;
    }


    for(var i = 0; i < 8; i++) {

        if (detailsArray.filter(function(e) { return e.place_id == radarArray[i].place_id; }).length == 0) {

            var detailsRequest = {
                placeId: radarArray[i].place_id
            }

            placesService.getDetails(detailsRequest, detailsCallback);
        }else{
            console.log("PLACE IS ALREADY IN DETAILS ARRAY");
            populateMap(detailsArray[i]);
        }

    }

    $('#places-show-more').unbind( "click" );
    $('#places-show-more').unbind( "dblclick" );
    $('#places-show-more').css('display', 'block').bind( "click", getNextPlaces).dblclick(function(e){
        console.log("double-clicked but did nothing");
        e.stopPropagation();
        e.preventDefault();
        return false;
    });
   
    console.log("radarArray:"); 
    console.log(radarArray); 
}


function getNextPlaces() {
    var mapItemId = $(".sidebar-item:last-child").attr('id');
    var numStr = mapItemId.substring(9);
    var start = (parseInt(numStr)) + 1;
    var end = start + 5;

    if (radarArray[end]) {

        console.log("testing radarArray: ");
        console.log(radarArray[start]);

        for(var i = start; i < end; i++) {
            
            //Check if object in radarArray is from Google Maps or Service Map API
                if(radarArray[i].place_id){
                    
                    
                    if (detailsArray.filter(function(e) { return e.place_id == radarArray[i].place_id; }).length == 0) {

                        var detailsRequest = {
                            placeId: radarArray[i].place_id
                        }

                        placesService.getDetails(detailsRequest, detailsCallback);
                    }else{

                        if(detailsArray[i]) {
                            console.log("PLACE IS ALREADY IN DETAILS ARRAY");
                            populateMap(detailsArray[i]);
                        }else{

                            console.log("undefined detailsArray value!");

                        }


                    }
                    
                    
                }else if (radarArray[i].id){
                    
                    
                    if (detailsArray.filter(function(e) { return e.id == radarArray[i].id; }).length == 0) {

                        populateMap(radarArray[i]);
                    }else{

                        if(detailsArray[i]) {
                            console.log("PLACE IS ALREADY IN DETAILS ARRAY");
                            populateMap(detailsArray[i]);
                        }else{

                            console.log("undefined detailsArray value!");

                        }


                    }
                    
                    
                        
                        
                }

            

        }

    }else{
        console.log("reached the end of radarArray!");
        
        for(var i = start; i < end; i++) {

            if(radarArray[i]) {
                
                
                //Check if object in radarArray is from Google Maps or Service Map API
                if(radarArray[i].place_id){
                    
                    
                    if (detailsArray.filter(function(e) { return e.place_id == radarArray[i].place_id; }).length == 0) {

                        var detailsRequest = {
                            placeId: radarArray[i].place_id
                        }

                        placesService.getDetails(detailsRequest, detailsCallback);
                    }else{

                        if(detailsArray[i]) {
                            console.log("PLACE IS ALREADY IN DETAILS ARRAY");
                            populateMap(detailsArray[i]);
                        }else{

                            console.log("undefined detailsArray value!");

                        }


                    }
                    
                    
                }else if (radarArray[i].id){
                    
                    if (detailsArray.filter(function(e) { return e.id == radarArray[i].id; }).length == 0) {

                        populateMap(radarArray[i]);
                    }else{

                        if(detailsArray[i]) {
                            console.log("PLACE IS ALREADY IN DETAILS ARRAY");
                            populateMap(detailsArray[i]);
                        }else{

                            console.log("undefined detailsArray value!");

                        }


                    }
                    
                }
                
                
                
                
                
            }else{
                $('#places-show-more').css('display', 'none');
                var sidebarFooterChildCount = document.getElementById("sidebar-footer").childElementCount;
                
                if(sidebarFooterChildCount == 1) {
                    $('#sidebar-footer').append("<p class=\"no-more-results-msg\">Sorry, couldn't find any more results!</p>");
                }
                
                console.log("radarArray:")
                console.log(radarArray);
                console.log("detailsArray:")
                console.log(detailsArray);
                break;
            }

        }
        
        
        
        /*

        for(var i = end - 1; i > start; i--) {

            if(radarArray[i]) {
                console.log("the last index of radarArray: " + i);
                end = i;
                console.log(radarArray);
                console.log(detailsArray);
                break;
            }

        }
        */
        
        

    }

    console.log(detailsArray.length);


}


function textCallback(results, status, pagination) {
    if (status !== google.maps.places.PlacesServiceStatus.OK) {
    console.error(status);
    return;
    }


    console.log(results);
    //console.log(results[0].geometry.location);

    var detailsRequest = {
        placeId: results[0].place_id
    }

    placesService.getDetails(detailsRequest, detailsCallback);

}

function detailsCallback(place, status) {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        console.error(status);
        return;
      }


     /*
    if($.inArray(place, detailsArray) == -1) {
            console.log("pushing place details into detailsArray");
            detailsArray.push(place);
    }



    if(detailsArray.length == 0) {
        console.log("pushing place details into detailsArray");
        detailsArray.push(place);
    }else{
        for (var i = 0; i < detailsArray.length; i++) {
            if (detailsArray[i] === place) {
                console.log("pushing place details into detailsArray");
                detailsArray.push(place);
                break;
            }
        }

    }
    */

    populateMap(place);

}



function populateMap(place) {


    if($.inArray(place, detailsArray) == -1) {
        console.log("pushing place details into detailsArray");
        detailsArray.push(place);
    }

    //detailsArray = jQuery.unique( detailsArray );

/*

    detailsArray = detailsArray.filter(function(item, pos) {
        return detailsArray.indexOf(item) == pos;
    });
    */

    markerMaker(place, markerID);
    //  Create a new viewpoint bound
    var bounds = new google.maps.LatLngBounds ();
    //  Go through each...
    for (var i = 0, ltLgLen = latLngList.length; i < ltLgLen; i++) {
        //  And increase the bounds to take this point
        bounds.extend (latLngList[i]);
    }
    //  Fit these bounds to the map
    map.fitBounds (bounds);


    //console.log(place);
    //$("#sidebar-content-wrapper").append('<div id="map-item-'+markerID+'" data-id="'+place.place_id+'" class="sidebar-item">'+place.name+'</div>');
    
    appendPlaceDetails(place, markerID)
    
    $(".sidebar-item:last-child").bind( "click", function() {

            console.log(place);

            var mapItemId = $(this).attr('id');

            var thisPlaceId = mapItemId.substring(9);

            //showPlaceDetails(place);
            
            //var thisInfoMarker = marker.get(markerID);
            //console.log(thisInfoMarker);
            var thismarker = markers[thisPlaceId];

            if(thismarker){
                map.setZoom(15);
                map.setCenter(thismarker.getPosition());
            }  

        });
     markerID++;
}


$("#dog-parks-button").click(function() {
    getDogParks();
});

function getDogParks(){
    $.ajax({
          url: 'http://www.hel.fi/palvelukarttaws/rest/v2/service/30927',
          dataType: 'jsonp',
          'success': processServiceMapResults  
    });
}



function processServiceMapResults(results){
    

    console.log(results);

    if(markers.length > 0){
        markers.forEach(markerRemover);
        markers = [];
        latLngList = [];
        markerID = 0;
        //radarArray = [];
    }
    
    $("#sidebar-content-wrapper").empty();

    for (var i = 0, result; result = results[i]; i++) {
      radarArray.push(result);
    }

    for(var i = 0; i < 8; i++) {
        
        
        if(radarArray[i]){

            if (detailsArray.filter(function(e) { return e.id == radarArray[i].id; }).length == 0) {
                populateMap(radarArray[i])
            }else{
                console.log("PLACE IS ALREADY IN DETAILS ARRAY");
                populateMap(detailsArray[i]);
            }
            
        }else{
            console.log("radarArray has less than 8 objects");
            break;
        } 
        
    }


    if(results.length > 0) {
        $('#places-show-more').unbind( "click" );
        $('#places-show-more').unbind( "dblclick" );
        $('#places-show-more').css('display', 'block').bind( "click", getNextPlaces).dblclick(function(e){
          console.log("double-clicked but did nothing");
          e.stopPropagation();
          e.preventDefault();
          return false;
        });
    }

    console.log("radarArray:"); 
    console.log(radarArray);


}


function appendPlaceDetails(value, markerID) {
    //console.log("User clicked on " + value.name_fi);

    var undefinedString = "Tietoa ei saatavilla";

    if(value.name_fi){
        var placeName = value.name_fi;
    }else if(value.name){
        var placeName = value.name;
    }

    if(value.street_address_fi) {
        var strAddr = value.street_address_fi;  
    }else if(value.formatted_address){
        var strAddr = value.formatted_address;  
    }

    if(value.phone) {
        var phoneNum = value.phone;
    }else if(value.formatted_phone_number){
        var phoneNum = value.formatted_phone_number;
    }else{
        var phoneNum = undefinedString;
    }

    if(value.email) {
        var emailAddr = value.email;
    }else{
        var emailAddr = undefinedString;
    }

    if(value.www_fi) {
        var webAddr = value.www_fi;
    }else if(value.website){
        var webAddr = value.website;
    }else{
        var webAddr = undefinedString;
    }
    
    var thisMapItem = $('<div id="map-item-'+markerID+'" class="sidebar-item"></div>');
    
    $(thisMapItem).append('<h4 class="place-name-fi">'+placeName+'</h4><div class="place-phone"><span>Phone: </span>'+phoneNum+'</div><div class="place-email"><span>Email: </span>'+emailAddr+'</div><div class="place-address"><span>Street address: </span>'+strAddr+'</div><div class="place-website-fi"><span>Website: </span>'+webAddr+'</div><div class="place-desc">Some description of the item</div>');
    
    $("#sidebar-content-wrapper").append(thisMapItem);

    //$("#place-info-container").empty();
    //$(".wrapper .place-info").remove();
   
}

function markerMaker(value, markerID){

    if(value.latitude && value.longitude){
        var latlng = {lat: value.latitude, lng: value.longitude};

        var marker = new google.maps.Marker({
          'position': latlng,
          'map': map
        });

        latLngList.push(new google.maps.LatLng(value.latitude, value.longitude));

    }else if(value.geometry.location){
       var location = value.geometry.location;

       var marker = new google.maps.Marker({
          'position': location,
          'map': map
        });

        latLngList.push(location);

    }else{
        console.log("No latitude and longitude values associated with the place/service");
        return;
    }

    markers.push(marker);

    google.maps.event.addListener(marker, 'click', function() {
        
        $(".sidebar-item").css('background-color', '#f6f6f6');
        
        var thisMapItem = $("#map-item-"+markerID);
        var myElement = document.getElementById('map-item-'+markerID);
        var topPos = myElement.offsetTop;
        
        $('#sidebar').animate({
            scrollTop: topPos
        }, 1000);
                
        $(thisMapItem).css('background-color', '#e2ffe2');
        
        map.setZoom(15);
        map.setCenter(marker.getPosition());

    });	
}

function markerRemover(marker){
    marker.setMap(null);
}

function populateSidebar(name) {
    $("#sidebar-content-wrapper").append('<div class="sidebar-item">'+name+'</div>');
}
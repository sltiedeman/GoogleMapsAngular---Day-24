var searchCity = '';
var currTemp = '';
var weatherIcon = '';
var iconHtml = '';

//Angular App Module and Controller
angular.module('myApp', []).controller('mapCtrl', function($scope){

	var mapOptions = {
		zoom: 4,
		//Center of the US
		center: new google.maps.LatLng(40.0000, -98.0000)
	}

	$scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
	$scope.markers = [];

	var infoWindow = new google.maps.InfoWindow();

	//createMarket Function
	var createMarker = function(city,index){

		var latLon = city.latLon.split(',');
		var lat = latLon[0];
		var lon = latLon[1];

		if(index==0){
			icon = 'assets/images/1.png';
		}else if(index==38){
			icon =  'assets/images/atl.png'
		}else{
			icon = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2%7CFE7569';
		}
		
		var marker = new google.maps.Marker({
			map: $scope.map,
			position: new google.maps.LatLng(lat, lon),
			title: city.city,
			icon: icon
		})

		markerContentHTML = '<div class="infoWindowContent">';
	    markerContentHTML += '<div class="total-pop">Total Population: ' + city.yearEstimate + '</div>';
	    markerContentHTML += '<div class="pop-dens-last-year">2010 Census: ' + city.lastCensus + '</div>';
	    markerContentHTML += '<div class="pop-change">Population Change %: ' + city.change + '</div>';
	    markerContentHTML += '<div class="pop-dens">Population Density: ' + city.lastPopDensity + '</div>';
	    markerContentHTML += '<div class="state">State: ' + city.state + '</div>';
	    markerContentHTML += '<div class="land-area">Land Area: ' + city.landArea + '</div>';
	    markerContentHTML += '<a href="#" onclick="getDirections('+lat+','+lon+')">Get directions</a>';
	    markerContentHTML += '</div>';

	    marker.content = markerContentHTML;
	    google.maps.event.addListener(marker, 'click', function(){
	    	infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
	    	infoWindow.open($scope.map, marker);
	    })
	    $scope.markers.push(marker);

	}

	$scope.triggerClick = function(i){
		google.maps.event.trigger($scope.markers[i-1],"click");
	}

	$scope.triggerSearch = function(latLon, city){
	 	searchCity = city;
		var latLon = latLon.split(',');
		var lat = Number(latLon[0]);
		var lon = Number(latLon[1]);
		$scope.map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: lat, lng: lon},
			zoom: 12
		});

		//Attempt to get golf courses
		
		var campgroundLocation = {lat:lat, lng:lon};

		infowindow = new google.maps.InfoWindow();

 		 var service = new google.maps.places.PlacesService($scope.map);
 		 service.nearbySearch({
 		 	location: campgroundLocation,
 		 	radius: 20000,
 		 	types: ['campground']
 		 }, callback);
 	}

 	function callback(results, status) {
  		if (status === google.maps.places.PlacesServiceStatus.OK) {
 		   for (var i = 0; i < results.length; i++) {
   		   createMarker2(results[i]);
 	 	  	}
 		}
	}

	function createMarker2(place) {
	  var placeLoc = place.geometry.location;
	  var icon = place.icon;
	  var marker = new google.maps.Marker({
	    map: $scope.map,
	    position: place.geometry.location,
	    icon: icon
	  });

	  //attempting to use the place id to pull data from the google maps object
	  var placeId = place.place_id;
	  var apiKey = 'AIzaSyC-2l77gW602XIxo5nXdfmrw8wNWLiv8KA';
	  var placeUrl = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + placeId +'&key=' + apiKey;
	 
	  var request = {
	  	placeId: placeId
	  };

	  console.log(searchCity);
	  var apiKey = 'eac2948bfca65b78a8c5564ecf91d00e';
	  var baseUrl = "http://api.openweathermap.org/data/2.5/weather?q=";
	  var endUrl = ',us&units=imperial&APPID='+apiKey;
	  var weatherUrl = baseUrl + searchCity + endUrl;
	  console.log(weatherUrl);
	  //Get weather Object
	  $.getJSON(weatherUrl, function(weatherData){
	  	   currTemp = weatherData.main.temp;
	  	   weatherIcon = weatherData.weather[0].icon;
		   iconHtml= '<img src="http://openweathermap.org/img/w/' + weatherIcon + '.png">';
	  });

	  var markerContentHTML = '';
	  service = new google.maps.places.PlacesService($scope.map);
	  service.getDetails(request, callback);
	  function callback(place, status) {
  		if (status == google.maps.places.PlacesServiceStatus.OK) {
  			console.log(place);
  			markerContentHTML = '<div class="infoWindowContent">';
  			if(place.formatted_address != undefined){	 	
  				markerContentHTML += '<div class="address">Address: ' + place.formatted_address + '</div>';	
  			}
  			if(place.formatted_phone_number != undefined){	
	    		markerContentHTML += '<div class="phone">Phone: ' + '<a href="tel:' + place.formatted_phone_number + '">' + place.formatted_phone_number + '</a>' + '</div>';
	    	}
	    	if(place.rating != undefined){
	    		markerContentHTML += '<div class="rating">Rating: ' + place.rating + '</div>';
	    	}
	    	if(place.website != undefined){
	    		markerContentHTML += '<div class="website">Website: ' + '<a href="' + place.website + '">' + place.website + '</a>' + '</div>';
	    	}
	    	markerContentHTML += '<div class="temp">Current Temp: ' + currTemp + '&#176' + iconHtml + '</div>';
	    	markerContentHTML += '</div>';
	    	marker.content = markerContentHTML;
	   		google.maps.event.addListener(marker, 'click', function(){
	    		infoWindow.setContent('<h2>' + place.name + '</h2>' + marker.content);
	    		infoWindow.open($scope.map, marker);
	   		 })
	     }
	   }

	}
 		


	

	$scope.updateMarkers = function(){
		for(i=0; i<$scope.markers.length; i++){
			$scope.markers[i].setMap(null);
		}
		for(i=0; i <$scope.filteredCities.length; i++){
			createMarker($scope.filteredCities[i],i);
		}
	}





	getDirections = function(lat, lon){
		var directionsService = new google.maps.DirectionsService();
   		var directionsDisplay = new google.maps.DirectionsRenderer();
   		var map = new google.maps.Map(document.getElementById('map'),{
   			zoom: 7,
   			mapTypeId: google.maps.MapTypeId.ROADMAP
   		})
   		directionsDisplay.setMap(map);
   		directionsDisplay.setPanel(document.getElementById('map-panel'));
   		var request = {
           //Origin hardcoded to Atlanta. Require geocode current loc,
           //or give user input
          origin: 'Atlanta, GA', 
          destination:new google.maps.LatLng(lat,lon), 
          travelMode: google.maps.DirectionsTravelMode.DRIVING
        };

        directionsService.route(request, function(response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
          }
        });
	}


	$scope.cities = cities;
	for(i = 0; i < cities.length; i++){
		createMarker(cities[i], i)
	}

});
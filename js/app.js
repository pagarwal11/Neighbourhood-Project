// locations data to display
var locations = [
  {
    title: 'Red Fort',
    position: { lat: 28.6562, lng: 77.241 },
    isShown: true,
    isSelected: false
  },
  {
    title: 'Qutub Minar',
    position: { lat: 28.5245, lng: 77.1855 },
    isShown: true,
    isSelected: false
  },
  {
    title: 'India Gate',
    position: { lat: 28.6129, lng: 77.2295 },
    isShown: true,
    isSelected: false
  },
  {
    title: 'Jama Masjid',
    position: { lat: 28.6507, lng: 77.2334 },
    isShown: true,
    isSelected: false
  },
  {
    title: 'Akshardham',
    position: { lat: 28.6127, lng: 77.2773 },
    isShown: true,
    isSelected: false
  }
];
var map, infowindow;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 28.6127,
      lng: 77.2773
    },
    zoom: 8
  });

  infowindow = new google.maps.InfoWindow();
  ko.applyBindings(new model());
}

function mapError() {
  document.getElementById('map-error').innerHTML = 'Map Error';
}

var model = function() {
  var self = this;
  self.errorDisplay = ko.observable('');
  self.locationsArray = [];

  for (var i = 0; i < locations.length; i++) {
    var place = new google.maps.Marker({
      position: {
        lat: locations[i].position.lat,
        lng: locations[i].position.lng
      },
      map: map,
      title: locations[i].title,
      isShown: ko.observable(locations[i].isShown),
      isSelected: ko.observable(locations[i].isSelected),
      animation: google.maps.Animation.DROP
    });

    self.locationsArray.push(place);
  }

  // bounce animation
  self.Bounce = function(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, 500);
  };

  // show all markers
  self.showAll = function(marker) {
    for (var i = 0; i < self.locationsArray.length; i++) {
      self.locationsArray[i].isShown(marker);
    }
  };

  // deselect all
  self.deselectAll = function() {
    for (var i = 0; i < self.locationsArray.length; i++) {
      self.locationsArray[i].isSelected(false);
    }
  };

  // display street view image of location in infowindow for marker
  var addStreetViewImage = function(marker) {
    if (infowindow.marker != marker) {
      infowindow.setContent('');
      infowindow.marker = marker;

      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
      var streetViewService = new google.maps.StreetViewService();
      var radius = 50;

      var windowContent = '<h4>' + marker.title + '</h4>';
      var getStreetView = function(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation,
            marker.position
          );
          infowindow.setContent(
            windowContent +
              '<div style = "height: 200px; width:200px"id="pano"></div>'
          );
          var panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: 20
            }
          };
          var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'),
            panoramaOptions
          );
        } else {
          infowindow.setContent(
            windowContent +
              '<div style="color: red">Street View Not Present</div>'
          );
        }
      };

      streetViewService.getPanoramaByLocation(
        marker.position,
        radius,
        getStreetView
      );
      infowindow.open(map, marker);
    }
  };

  // add additional information for marker
  var addMarkerInfo = function(marker) {
    marker.addListener('click', function() {
      addStreetViewImage(marker);
      self.setSelected(this);
    });
  };

  for (var i = 0; i < self.locationsArray.length; i++) {
    addMarkerInfo(self.locationsArray[i]);
  }

  self.searchText = ko.observable('');

  // filter the results based on value entered in search box
  self.filterList = function() {
    var currentText = self.searchText();
    infowindow.close();

    if (currentText.length === 0) {
      self.showAll(true);
    } else {
      for (var i = 0; i < self.locationsArray.length; i++) {
        if (
          self.locationsArray[i].title
            .toLowerCase()
            .indexOf(currentText.toLowerCase()) > -1
        ) {
          self.locationsArray[i].isShown(true);
        } else {
          self.locationsArray[i].isShown(false);
        }
      }
    }
    infowindow.close();
  };

  self.currentLocation = self.locationsArray[0];

  self.setSelected = function(position) {
    self.deselectAll();
    position.isSelected(true);
    self.currentLocation = position;
    var InfoWindow = '<h4>' + self.currentLocation.title + '</h4>';
    infowindow.setContent(InfoWindow);
    infowindow.open(map, position);
    self.Bounce(position);
  };
};

// Init map
var map = L.map('map').setView([18.505, -8], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var markers = L.markerClusterGroup();
map.addLayer( markers );


// Run query and add to map
var lang = 'en';
var q = `SELECT DISTINCT ?coord ?photo ?collection ?collectionLabel (COUNT(?item) AS ?count) WHERE {
  ?item wdt:P31 wd:Q3305213.
  ?item wdt:P18 ?image.
  ?item (wdt:P195/wdt:P361*) ?collection.
  ?collection wdt:P625 ?coord.
  ?collection wdt:P18 ?photo.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang}". }
}
GROUP BY ?collection ?collectionLabel ?coord ?photo
HAVING (?count > 10)
ORDER BY DESC (?count)`;

runQuery( q ).then( function ( data ) {
  data.forEach( function (d) {
    var uri = getImageUri( d.photo.value );
    var popup = `<img src=${uri} width="200"/><br>`;
    var id = d.collection.value.split('Q')[1];
    //https://commons.wikimedia.org/w/thumb.php?width=500&f=20070223%20AlbrightKnox%20Art%20Gallery.JPG
    //20070223%20AlbrightKnox%20Art%20Gallery.JPG
    popup += `<strong><a href="/museum.html#${id}">${d.collectionLabel.value}</a> (${d.count.value})</strong>`

    markers.addLayer(
      L.marker( getCoordFromPoint( d.coord.value ) )
        .bindPopup(popup)
    );
  });
})

function getImageUri(uri) {
  var file = uri.split( 'Special:FilePath/');
  file = file[ file.length - 1 ];
  return 'https://commons.wikimedia.org/w/thumb.php?width=200&f=' + file;
}

function getCoordFromPoint( p ) {
  var coord = p.substring(6, p.length-1).split(' ');
  coord[0] = +coord[0];
  coord[1] = +coord[1];
  return [ coord[1], coord[0]];
}

var fetch = require("node-fetch");
var fs = require('fs');

var data = [];


getPaintings().then( function (paintings) {
  console.log( 'Got ' + paintings.length + ' paintings.')
  saveData( paintings );
});


function saveData(data) {
  fs.writeFile( "./museums.json", JSON.stringify(data), 'utf8', function ( err ) {
    if (err){
      return console.log(err);
    }
    console.log( 'File was saved!')
  } );
}

function getId( uri ) {
  var uri = uri.split('/');
  return uri[uri.length - 1];
}

function getMuseumsWithPaintings() {
  query = `SELECT DISTINCT ?collection ?collectionLabel WHERE {
  ?item wdt:P31 wd:Q3305213.
  ?item (wdt:P195/wdt:P361*) ?collection.
  ?item wdt:P18 ?image.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }
}`;

  return runQuery( query );
}

function getPaintings() {
  var query = `SELECT DISTINCT ?item ?itemLabel ?itemDescription ?image ?collection WHERE {
    ?item wdt:P31 wd:Q3305213 .
    ?item wdt:P195/wdt:P361* ?collection .
    ?item wdt:P18 ?image .
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]" }

  }LIMIT 100`;

  return runQuery( query );
}
function getMuseums() {
  var query = `SELECT ?item ?itemLabel WHERE {
    ?item wdt:P31/wdt:P279* wd:Q33506.
    ?item wdt:P17 wd:Q668.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`;
  return runQuery( query );
}

function getPaintingsInMuseums( mIds ) {
  var filter = mIds.map( function (id) {
    return '?collection = wd:' + id;
  }).join( ' || ');

  var query = `SELECT DISTINCT ?item ?itemLabel ?itemDescription ?image ?collection WHERE {
    ?item wdt:P31 wd:Q3305213;
          wdt:P18 ?image;
          wdt:P195/wdt:P361* ?collection .
    FILTER ( ` + filter + ` )
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]" }
  }`;
  return runQuery( query );
}

function getPaintingsInMuseum(q) {
  var query = `SELECT DISTINCT ?item ?itemLabel ?itemDescription ?image WHERE {
    ?item wdt:P31 wd:Q3305213 .
    ?item wdt:P195/wdt:P361* wd:` + q + ` .
    ?item wdt:P18 ?image .
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]" }
  }`;

  return runQuery( query )
}

function runQuery( query ) {
return fetch( 'https://query.wikidata.org/sparql?query=' + query + '&format=json' ).then( function (data) {
  console.log( data);
    return data.json();
  }).then( function (json) {
    return json.results.bindings;
  });
}

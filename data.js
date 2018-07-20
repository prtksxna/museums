var fetch = require("node-fetch");
var fs = require('fs');

var data = [];


getMuseums().then( function (museums) {
  console.log( 'Got ' + museums.length + ' museums.')
  museums.forEach( function (museum) {
    data.push(museum.itemLabel.value)
    //var mId = getId( m.item.value );
    //window.setTimeout( function () {
      //getPaintingsInMuseum( mId ).then( function (p) {
      //  console.log( p.results.bindings );
      //})

    //}, i*100)
  })
  saveData( data );
});


function saveData(data) {
  fs.writeFile( "./museums.json", JSON.stringify(data), 'utf8' );
}

function getId( uri ) {
  var uri = uri.split('/');
  return uri[uri.length - 1];
}

function getMuseums() {
  var query = `SELECT ?item ?itemLabel WHERE {
    ?item wdt:P31/wdt:P279* wd:Q33506.
    ?item wdt:P17 wd:Q668.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
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
    return data.json();
  }).then( function (json) {
    return json.results.bindings;
  });
}

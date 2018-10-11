function runQuery( query ) {
  query = encodeURIComponent(query);
  return fetch( 'https://query.wikidata.org/sparql?query=' + query + '&format=json' ).then( function (data) {
    return data.json();
  }).then( function (json) {
    return json.results.bindings;
  });
}

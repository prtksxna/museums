var qId = 'Q' + window.location.hash.substr(1);
var query = `SELECT DISTINCT ?painting ?paintingLabel ?photo ?inception ?artistLabel WHERE {
  ?painting wdt:P31 wd:Q3305213.
  ?painting (wdt:P195/wdt:P361*) wd:${qId}.
  ?painting wdt:P18 ?photo.
  OPTIONAL { ?painting wdt:P571 ?inception }
  OPTIONAL { ?painting wdt:P170 ?artist }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`;

runQuery( query ).then( function ( data ) {
  data.forEach( function ( d ) {
    var uri = getImageThumb( d.photo.value, 200 );
    var biguri = getImageThumb( d.photo.value, 1200 );
    var id = "Q" + d.painting.value.split("Q")[1];


    var img = document.createElement( 'img' );
    img.setAttribute( 'src', biguri );
    img.setAttribute( 'id', id );
    img.setAttribute( 'crossorigin', 'anonymous' );

    var thumb = document.createElement( 'img' );
    thumb.setAttribute( 'src', uri );
    thumb.setAttribute( 'id', id + '-thumb' );
    thumb.setAttribute( 'crossorigin', 'anonymous' );

    document.getElementById( "paintings" ).append( img );
    document.getElementById( "paintings" ).append( thumb );

    var entity = document.createElement( 'a-entity' );
    entity.setAttribute( 'template', 'src: #link' );
    entity.setAttribute( 'data-src', '#' + id );
    entity.setAttribute( 'data-thumb', '#' + id + '-thumb' );
    document.getElementById( "links").append( entity );
  } );
} );

function getBase64FromImageUrl(url) {
    var img = new Image();

    img.setAttribute('crossOrigin', 'anonymous');

    img.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width =this.width;
        canvas.height =this.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        console.log(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
    };

    img.src = url;
}

function getImageUri(uri, size) {
  var file = uri.split( 'Special:FilePath/');
  file = file[ file.length - 1 ];

  return 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/'+file+'/100px-'+file;
  return 'https://commons.wikimedia.org/wiki/Special:FilePath?width=100&file=' + file;
  return 'https://commons.wikimedia.org/w/thumb.php?width='+size+'&f=' + file;
}

function getImageThumb(uri,size) {
  var file = uri.split( 'Special:FilePath/');
  file = file[ file.length - 1 ];
  file = unescape( file );
  file = file.split(' ').join('_');
  filemd = md5( file );
console.log(file);
  var uri = 'https://upload.wikimedia.org/wikipedia/commons/thumb/' +
    filemd[0] + '/' + filemd[0] + filemd[1] + '/' + file +
    '/'+size+'px-' + file;

  return uri;
}

// Amrita_Sger-Gil_Klarra_Szepessy.jpg
// Amrita Sger-Gil Klarra Szepessy.jpg




AFRAME.registerComponent('set-image', {
  schema: {
    on: {type: 'string'},
    target: {type: 'selector'},
    src: {type: 'string'},
    dur: {type: 'number', default: 300}
  },

  init: function () {
    var data = this.data;
    var el = this.el;

    this.setupFadeAnimation();

    el.addEventListener(data.on, function () {
      // Fade out image.
      data.target.emit('set-image-fade');
      // Wait for fade to complete.
      setTimeout(function () {
        // Set image.
        data.target.setAttribute('material', 'src', data.src);
      }, data.dur);
    });
  },

  /**
   * Setup fade-in + fade-out.
   */
  setupFadeAnimation: function () {
    var data = this.data;
    var targetEl = this.data.target;

    // Only set up once.
    if (targetEl.dataset.setImageFadeSetup) { return; }
    targetEl.dataset.setImageFadeSetup = true;

    // Create animation.
    targetEl.setAttribute('animation__fade', {
      property: 'material.color',
      startEvents: 'set-image-fade',
      dir: 'alternate',
      dur: data.dur,
      from: '#FFF',
      to: '#000'
    });
  }
});

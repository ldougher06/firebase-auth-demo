var FIREBASE_URL = 'https://c9-demo.firebaseio.com';
var fb = new Firebase(FIREBASE_URL);
var API_URL = 'http://www.omdbapi.com/?';
var initLoad = true;

$('.onLoggedIn form').submit(function () {
  var title = $('.onLoggedIn input[type="text"]').val();
  var url = API_URL + 't=' + title + '&r=json';
  var uid = fb.getAuth().uid;
  var token = fb.getAuth().token;
  var postUrl = `${FIREBASE_URL}/users/${uid}/fotos.json?auth=${token}`;

$.get(url, function(data){
  //$.get only gets the data to the screen from the API. Then need another button to $.post to firebase.
  $.post(postUrl, JSON.stringify(data), function (res) {
    createMovieNode(data, res.Title);
    clearForms();
    // res = { name: '-Jk4dfDd123' }
  })
});

  event.preventDefault();
})

$('.onTempPassword form').submit(function () {
  var email = fb.getAuth().password.email;
  var oldPw = $('.onTempPassword input:nth-child(1)').val();
  var newPw = $('.onTempPassword input:nth-child(2)').val();

  fb.changePassword({
    email: email,
    oldPassword: oldPw,
    newPassword: newPw
  }, function(err) {
    if (err) {
      alert(err.toString());
    } else {
      fb.unauth();
    }
  });

  event.preventDefault();
})

$('.doResetPassword').click(function () {
  var email = $('.onLoggedOut input[type="email"]').val();

  fb.resetPassword({
    email: email
  }, function (err) {
    if (err) {
      alert(err.toString());
    } else {
      alert('Check your email!');
    }
  });
});

$('.doLogout').click(function () {
  fb.unauth(function () {
    window.location.reload();
  });
})

$('.doRegister').click(function () {
  var email = $('.onLoggedOut input[type="email"]').val();
  var password = $('.onLoggedOut input[type="password"]').val();

  fb.createUser({
    email: email,
    password: password
  }, function (err, userData) {
    if (err) {
      alert(err.toString());
    } else {
      clearForms();
      doLogin(email, password, function () {
        window.location.reload();
      });
    }
  });

  event.preventDefault();
});

$('.onLoggedOut form').submit(function () {
  var email = $('.onLoggedOut input[type="email"]').val();
  var password = $('.onLoggedOut input[type="password"]').val();

  doLogin(email, password, function () {
    window.location.reload();
  });
  event.preventDefault();
});

function clearForms () {
  $('input[type="text"], input[type="url"]').val('');
}

function saveAuthData (authData) {
  $.ajax({
    method: 'PUT',
    url: `${FIREBASE_URL}/users/${authData.uid}/profile.json?auth=${authData.token}`,
    data: JSON.stringify(authData)
  });
}

function doLogin (email, password, cb) {
  fb.authWithPassword({
    email: email,
    password: password
  }, function (err, authData) {
    if (err) {
      alert(err.toString());
    } else {
      saveAuthData(authData);
      typeof cb === 'function' && cb(authData);
    }
  });
}

function getUserData (cb) {
  var uid = fb.getAuth().uid;
  var token = fb.getAuth().token;
  var getUrl = `${FIREBASE_URL}/users/${uid}/fotos.json?auth=${token}`;
  $.get(getUrl, cb);
}

function createMovieNode (data, id) {
  console.log(data);
  console.log(id);
  var html = "<div data-id=" + id + " class='movie'><div><img src=" + data.Poster + " alt='" + data.Title + "'></img></div>";
  html += "<div>" + data.Title + "</div>";
  html += "<div>" + data.Year + "</div>";
  html += "<div>" + data.Genre + "</div>";
  html += "<div>" + data.Director + "</div>";
  html += "<div>" + data.Plot + "</div>";
  html += "<div><div class='imdbLogo'>" + data.imdbRating + "</div>";
  html += "<div>Metascore " + data.Metascore + "/100</div>";
  $(html).prependTo('.favFotos');
  //if (data) {
    //Object.keys(data).forEach(function (id){
    //$('<ul data-id=' + id +'><li>' + data.Poster + "</li></ul>").appendTo($('.favFotos'));
    //$('<ul data-id=' + id +'><li>' + data.Title + "</li></ul>").appendTo($('.favFotos'));
    //$('<ul data-id=' + id +'><li>' + data.Year+ "</li></ul>").appendTo($('.favFotos'));
    //$('<ul data-id=' + id +'><li>' + data.Genre + "</li></ul>").appendTo($('.favFotos'));
    //$('<ul data-id=' + id +'><li>' + data.Director + "</li></ul>").appendTo($('.favFotos'));
    //$('<ul data-id=' + id +'><li>' + data.Plot + "</li></ul>").appendTo($('.favFotos'));
    //$('<ul data-id=' + id +'><li>' + data.imdbRating + "</li></ul>").appendTo($('.favFotos'));
    //$('<ul data-id=' + id +'><li>' + data.Metascore + "</li></ul>").appendTo($('.favFotos'));

    };
  //}
//}

fb.onAuth(function (authData) {
  if (initLoad) {
    var onLoggedOut = $('.onLoggedOut');
    var onLoggedIn = $('.onLoggedIn');
    var onTempPassword = $('.onTempPassword');

    if (authData && authData.password.isTemporaryPassword) {
      // temporary log in
      onTempPassword.removeClass('hidden');
      onLoggedIn.addClass('hidden');
      onLoggedOut.addClass('hidden');
    } else if (authData) {
      // logged in
      onLoggedIn.removeClass('hidden');
      onLoggedOut.addClass('hidden');
      onTempPassword.addClass('hidden');
      $('.onLoggedIn h1').text(`Hello ${authData.password.email}`);
      getUserData(function (urls) {
        createMovieNode(urls);
      });
    } else {
      // on logged out
      onLoggedOut.removeClass('hidden');
      onLoggedIn.addClass('hidden');
      onTempPassword.addClass('hidden');
    }
  }

  initLoad = false;
});

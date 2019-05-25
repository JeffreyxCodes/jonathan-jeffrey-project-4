const app = {};

app.$form = $(`form`);
app.$select = $(`select`);
app.$gallery = $(`.gallery`);
app.$total = $(`.totalScore span`);
app.$current = $(`.currentScore span`);
app.$guessResult = $(`.guessResult`);
app.$finalResults = $(`.finalResults`);

app.jeffKey = `12555766-60a7aff87d1d36db9d295d797`;
app.jonKey = `12587084-ebb22b9796ba7d7909fc305ca`;
app.colinKey = `12587414-46698cf6327a0b2f9a96c668c`;

app.totalScore = 0;
app.currentScore = 4;
app.hintIndex = 0;

// specifies the number of songs per game and number of options per song
app.totalSongs = 2;
app.totalOptions = 10;

app.quizList = undefined;
app.currentSongIndex = undefined;
app.currentSong = undefined;

// given 3 positive integers possibleIndexes, arrayLength, and mustContain
// where possibleIndexes >= arrayLength, mustContain;
// return an unordered array of length arrayLength of integers containing unique
// integers between 0 and possibleIndexes, and must include mustContain
app.getRandomArray = function(possibleIndexes, arrayLength, mustContain) {
  const orderedArray = [];
  const randomArray = [];

  for (let i = 0; i < possibleIndexes; i++) {
    orderedArray.push(i);
  }

  if (mustContain) {
    // if mustContain is given make sure it is in there
    // remove the mustContain from orderedArray to have it added randomly last
    orderedArray.splice(mustContain, 1);
    for (let i = 1; i < arrayLength; i++) {
      randomArray.push(
        orderedArray.splice(
          Math.floor(Math.random() * orderedArray.length),
          1
        )[0]
      );
    }
    // add the mustContain randomly into the randomArray
    randomArray.splice(Math.floor(Math.random() * arrayLength), 0, mustContain);
  } else {
    // if mustContain is not given then the values of the array would be absolutely random
    for (let i = 0; i < arrayLength; i++) {
      randomArray.push(
        orderedArray.splice(
          Math.floor(Math.random() * orderedArray.length),
          1
        )[0]
      );
    }
  }

  return randomArray;
};

// set the list of random songs for the game
app.setQuizList = function() {
  app.quizList = app.getRandomArray(songArray.length, app.totalSongs);
  app.currentSongIndex = app.quizList[app.quizList.length - 1];
  app.currentSong = songArray[app.currentSongIndex];
};

// populate the drop down menu with the random options
app.populateDropDown = function() {
  // set the list of random options
  let options = app.getRandomArray(
    songArray.length,
    app.totalOptions,
    app.currentSongIndex
  );

  options = options.map(index => {
    return `<option value="${songArray[index].track}">"${
      songArray[index].track
    }" by ${songArray[index].artist}</option>>`;
  });

  // put the drop down options onto the DOM
  app.$select.html(options);
};

// get a promise given a query
app.getImagePromise = function(q) {
  return $.ajax({
    url: `https://pixabay.com/api/`,
    method: `GET`,
    dataType: `jsonp`,
    data: {
      key: app.colinKey,
      q: q,
      orientation: `horizontal`
    }
  });
};

// populate the DOM with images related to the last song positioned in the array
app.getImages = function() {
  const imgPromises = [];

  for (let i = 0; i < 9; i++) {
    imgPromises.push(
      app.getImagePromise(songArray[app.currentSongIndex].convert[i])
    );
  }

  $.when(...imgPromises)
    .then((...images) => {
      images = images.map((img, index) => {
        return `<div class="imgContainer item${index}">
                            <h2 class="hint">${
                              app.currentSong.hints[index]
                            }</h2>
                            <img class="cover" src=${
                              img[0].hits[0].webformatURL
                            } alt="${img[0].hits[0].tags}">
                        </div>`;
      });
      // put the images into the DOM
      app.$gallery.html(images);
    })
    .fail(error => {
      console.log(error);
    });
};

//*******************************************************************************
//*******************************************************************************
//-- THIS IS ONLY FOR TESTING, REPLACE THIS WITH "app.getImages" IN PRODUCTION --
//*******************************************************************************
//*******************************************************************************
app.testImages = function() {
  const images = [];
  for (let i = 0; i < 9; i++) {
    images.push(`<div class="imgContainer item${i}">
                            <h2 class="hint">Hint${i} Placeholder</h2>
                            <img class="cover" src="" alt="">
                        </div>`);
  }
  app.$gallery.html(images);
  console.log(app.currentSong.track);
};
//*******************************************************************************
//*******************************************************************************
//*******************************************************************************

// refresh the DOM with the elements for the next song
app.next = function() {
  console.log(app.quizList);
  if (app.quizList.length > 1) {
    // if there are still songs on the list
    // reset current score & hintIndex
    app.currentScore = 4;
    app.$current.html(4);
    app.hintIndex = 0;

    // update the song list and current song
    app.quizList.pop();
    app.currentSong = songArray[--app.currentSongIndex];

    // populate the dom with the elements for the next song
    //   app.getImages();
    app.testImages(); // REMOVE IN PRODUCTION & REPLACE WITH ABOVE
    app.populateDropDown();
    app.$guessResult.fadeOut();
    app.$form.fadeIn();
  } else {
    // display final score
    app.$finalResults.children(`h2 .finalScore`).html(`${app.totalScore} / 40`);
    app.$finalResults.fadeIn();
  }
};

// display response to a song's final guess
app.showResult = function(response) {
  // display the appropriate response
  app.$form.fadeOut();
  app.$guessResult.children(`div`).html(response);
  app.$guessResult.fadeIn();
};

// initialize the submit button
app.initSubmit = function() {
  app.$form.on("submit", e => {
    e.preventDefault();
    console.log(app.currentSong.track); // FOR TESTING ***********************
    if (app.currentSong.track === app.$select.val()) {
      // when the user is correct
      app.totalScore += app.currentScore;
      app.$total.html(app.totalScore);

      app.showResult(`<h2>You Got It! The Correct Song Is Indeed:</h2>
                    <h2>"${app.currentSong.track}" by ${
        app.currentSong.artist
      }</h2>`);
    } else {
      // when the user is wrong, update the current score
      app.currentScore--;
      app.$current.html(app.currentScore);

      // changed the styling of already selected options
      app.$select.children(`option:selected`).css({
        background: "tomato"
      });
      if (app.currentScore > 0) {
        // show hints if not all hints are shown
        // show the hints
        $(`.item${app.hintIndex++}`).toggleClass(`showHint`);
        $(`.item${app.hintIndex++}`).toggleClass(`showHint`);
        $(`.item${app.hintIndex++}`).toggleClass(`showHint`);
      } else {
        app.showResult(`<div><h2>You Guessed Wrong! The Correct Song Is Actually:</h2>
                        <h2>"${app.currentSong.track}" by ${
          app.currentSong.artist
        }</h2></div>`);
      }
    }
  });
};

// initialize the button for next song
app.initNext = function() {
  $(`.guessResult button`).on("click", () => {
    app.next();
  });
};

// initialize the button to start the game
app.initStart = function() {
  $(".instruction button").on("click", () => {
    $(".instruction").fadeOut();
  });
};

// initialize the button to restart the game
app.initRestart = function() {
  $(`.finalResults button`).on(`click`, () => {
    app.totalScore = 0;
    app.currentScore = 4;
    app.hintIndex = 0;
    app.setQuizList();
    // app.getImages();
    app.testImages(); // REMOVE IN PRODUCTION & REPLACE WITH ABOVE
    app.populateDropDown();
    app.$finalResults.fadeOut();
  });
};

// init
app.init = function() {
  // initialize the start button to start game
  app.initStart();

  // set the song list to go through for the game
  app.setQuizList();
  // populare the gallery with the relevent images to the song
  // app.getImages();
  app.testImages(); // REMOVE IN PRODUCTION & REPLACE WITH ABOVE
  // populate the drop down menu with the appropriate song choices
  app.populateDropDown();

  //initialize the submit button, next button, and restart button
  app.initSubmit();
  app.initNext();
  app.initRestart();
  // console.log(app.quizList.length);
};

$(function() {
  app.init();
});

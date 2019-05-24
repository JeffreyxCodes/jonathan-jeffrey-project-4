const app = {};

app.$form = $(`form`);
app.$select = $(`select`);
app.$gallery = $(`.gallery`);
app.$total = $(`.totalScore span`);
app.$current = $(`.currentScore span`);
app.$guessResult = $(`.guessResult`);

app.totalScore = 0;
app.currentScore = 4;
app.hintIndex = 0;

app.quizList = [];
app.currentSongIndex = undefined;
app.currentSong = undefined;

// set the list of songs for the game
app.setQuizList = function () {
    const index = Object.keys(songArray);
    const length = index.length;
    let itemIndex;

    for (let i = 0; i < length; i++) {
        itemIndex = Math.floor(Math.random() * index.length);
        app.quizList.push(index.splice(itemIndex, 1));
    }
    app.currentSongIndex = app.quizList[app.quizList.length - 1];
    app.currentSong = songArray[app.currentSongIndex];
};

// populate the drop down menu with appropriate options
app.populateDropDown = function () {
    const options = songArray.map(song => {
        return `<option value="${song.track}">"${song.track}" by ${song.artist}</option>>`;
    });
    // put the drop down options onto the DOM
    app.$select.html(options);
};

// get a promise given a query
app.getImagePromise = function (q) {
    return $.ajax({
        url: `https://pixabay.com/api/`,
        method: `GET`,
        dataType: `jsonp`,
        data: {
            key: `12555766-60a7aff87d1d36db9d295d797`,
            q: q,
            orientation: `horizontal`
        }
    });
};

// get and put the images related to a song
app.getImages = function () {
    const imgPromises = [];

    for (let i = 0; i < 9; i++) {
        imgPromises.push(app.getImagePromise(songArray[app.currentSongIndex].convert[i]));
    }

    $.when(...imgPromises)
        .then((...images) => {
            images = images.map((img, index) => {
                return `<div class="imgContainer item${index}">
                            <h2 class="hint">${img[0].hits[0].tags}</h2>
                            <img class="cover" src=${img[0].hits[0].webformatURL} alt="${img[0].hits[0].tags}">
                        </div>`;
            });
            // put the images into the DOM
            app.$gallery.html(images);
        })
        .fail(error => {
            console.log(error);
        });
};

// initialize the submit button
app.initSubmit = function () {
    app.$form.on("submit", e => {
        e.preventDefault();

        if (app.quizList.length > 0) { // if there are still songs on the list
            if (app.currentSong.track === app.$select.val()) { // when user is correct
                // update the total score and current score
                app.totalScore += app.currentScore;
                app.$total.html(app.totalScore);
                app.$current.html(4);

                // update the song list and current song
                app.quizList.pop();
                app.currentSongIndex--;
                app.currentSong = songArray[app.currentSongIndex];

                // populate the dom with the elements for the next song
                app.getImages();
                app.populateDropDown();   
            } else if (app.currentScore > 1) {
                // update the current score
                app.currentScore--;
                app.$current.html(app.currentScore);

                // show the hints
                $(`.item${app.hintIndex++}`).toggleClass(`showHint`);
                $(`.item${app.hintIndex++}`).toggleClass(`showHint`);
                $(`.item${app.hintIndex++}`).toggleClass(`showHint`);
            } else {
                app.$form.fadeOut();
                app.$guessResult.fadeIn();
            }
        }
    });
};

// initialize the start button
app.initStart = function () {
    $("button").on("click", () => {
        $(".instructionModal").fadeOut();
    });
};

// init
app.init = function () {
    app.initStart();

    app.setQuizList();
    app.getImages();
    app.populateDropDown();
    app.initSubmit();
    // console.log(app.quizList.length);
};

$(function () {
    app.init();
});

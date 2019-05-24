const app = {};

app.$form = $(`form`);
app.$select = $(`select`);
app.$gallery = $(`.gallery`);
app.$total = $(`.totalScore span`);
app.$current = $(`.currentScore span`);

app.totalScore = 0;
app.currentScore = 5;

app.quizList = [];
app.currentSongIndex = undefined;
app.currentSong = undefined;

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

// app.addScore = function() {
//     if(app.quizList.length > 0 && app.quizList[app.quizList.length-1]){

//     }
// };

app.populateDropDown = function () {
    const options = songArray.map(song => {
        return `<option value="${song.track}">"${song.track}" by ${
            song.artist
            }</option>>`;
    });
    app.$select.html(options);
};

app.getImages = function () {
    const imgPromises = [];

    for (let i = 0; i < 9; i++) {
        imgPromises.push(app.getImagePromise(songArray[app.currentSongIndex].convert[i]));
    }

    $.when(...imgPromises)
        .then((...images) => {
            images = images.map(img => {
                return `<img class="cover" src=${img[0].hits[0].webformatURL} alt="${img[0].hits[0].tags}">`;
            });

            app.$gallery.html(images);
        })
        .fail(error => {
            console.log(error);
        });
};

app.initSubmit = function () {
    app.$form.on("submit", e => {
        e.preventDefault();

        if (app.quizList.length > 0) {
            if (app.currentSong.track === app.$select.val()) {
                app.totalScore += app.currentScore;
                app.$total.html(app.totalScore);
                app.$current.html(4);

                app.quizList.pop();
                app.currentSongIndex--;
                app.currentSong = songArray[app.currentSongIndex];

                app.getImages();
                app.populateDropDown();   
            } else if (false) {

            }
        }
    });
};

app.initStart = function () {
    $("button").on("click", () => {
        $(".instructionModal").fadeOut();
    });
};

app.init = function () {
    app.initStart();

    app.setQuizList();
    app.getImages();
    app.populateDropDown();
    app.initSubmit();
    console.log(app.quizList.length);
};

$(function () {
    app.init();
});

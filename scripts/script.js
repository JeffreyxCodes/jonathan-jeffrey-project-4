const app = {};

app.index = Object.keys(songArray);
app.quizList = [];

app.setQuizList = function() {
    const length = app.index.length;
    let itemIndex;

    for (let i = 0; i < length; i++) {
        itemIndex = Math.floor(Math.random() * app.index.length);
        app.quizList.push(app.index.splice(itemIndex, 1));
    }

    console.log(app.quizList);
    console.log("index array: ", app.index);
}

app.getImagePromise = function(q) {
    return $.ajax({
        url: `https://pixabay.com/api/`,
        method: `GET`,
        dataType: `jsonp`,
        data: {
            key: `12555766-60a7aff87d1d36db9d295d797`,
            q: q
        }
    });
}

app.getImages = function() {
    const imgPromises = [];

    for (let i = 0; i < 9; i++) {
        imgPromises.push(app.getImagePromise(songArray[0].convert[i])); 
    };

    $.when(...imgPromises)
        .then((...images) => {
            images = images.map(img => {
                return `<img class="cover" src=${img[0].hits[0].webformatURL} alt="${img[0].hits[0].tags}">`;
            });

            $(`.gallery`).html(images);
        })
        .fail(error => {
            console.log(error);
        });
}

app.init = function() {
    app.setQuizList();
    // app.getImages();
}

$(function() {
    app.init();
});
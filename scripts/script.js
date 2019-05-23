const app = {};

app.index = Object.keys(songArray);

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
    const a = [];
    // console.log(songArray[0].convert[0]);
    for (let i = 0; i < 9; i++) {
        console.log(typeof songArray[0].convert);
        a.push(app.getImagePromise(songArray[0].convert[i])); 
    };

    $.when(...a)
        .then((...img) => {
            a.map(img => {
                `<img class="cover" src="${img.hits[0].webformatURL}" alt="${img.hits[0].tags}">`
            });
        })
        .fail(error => {
            console.log(error);
        });
    
    $(`.gallery`).html(a);
}

app.init = function() {
    app.getImages();
}

$(function() {
    app.init();
});
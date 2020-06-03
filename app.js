var responsePart = 0;

axios.get("https://rickandmortyapi.com/api/episode").then(response => updateNav(response.data));

function updateNav(data) {
    // Eliminates all the previous links on the navigation menu
    $("nav a").remove();
    $("nav button").remove();
    for (let i = 0; i < data.results.length-responsePart; i++) {
        // Break to show only 10 episodes on the navigation menu
        if (i == 10) break;
        $("#nav__episodes").append($("<a>").text("Episode "+ data.results[i+responsePart].id)
        .click(() => showEpisode(data.results[i+responsePart].url)));
    }
    // If there's a "next" link or it's on the first part of a response puts a NEXT BUTTON
    if (data.info.next != null || responsePart == 0) {
        $("#nav__buttons").append($("<button>").text("Next").addClass("next").click( () => {
            if(responsePart == 10) {
                responsePart = 0;
                axios.get(data.info.next).then(response => updateNav(response.data));
            } else {
                responsePart = 10;
                updateNav(data);
            }
        }));
    }
    // If there's a "previous" link or it's on the second part of a response puts a PREVIOUS BUTTON
    if (data.info.prev != null || responsePart == 10) {
        $("#nav__buttons").append($("<button>").text("Previous").addClass("previous").click(() => {
            if (responsePart == 0) {
                responsePart = 10;
                axios.get(data.info.prev).then(response => updateNav(response.data));
            } else {
                responsePart = 0;
                updateNav(data)
            }
        }));
    }
}

function showEpisode(epi) {
    axios.get(epi)
    .then(response => {
        // Resets the main container
        $("#main__container").empty();
        // Applying episode info on the main container
        $("#main__container").append($("<h2>").text("Episode "+response.data.id+" • "+response.data.name));
        $("#main__container").append($("<p>").text(response.data.episode+" • "+response.data.air_date));
        $("#main__container").append("<ul>");
        for (let i = 0; i < response.data.characters.length; i++) {
            // Getting characters info on "characters" endpoint to show them on the main container
            axios.get(response.data.characters[i]).then(character => {
                $("#main__container ul").append($("<li>")
                .append($("<img>").attr("src",character.data.image))
                .append($("<p>").text(character.data.name))
                .append($("<p>").text(character.data.species+" | "+character.data.status))
                .click(() => showCharacter(response.data.characters[i])));
            }).then(() => $("#main__container li").slideDown(600,"linear"));
        }
    });
}

function showCharacter(characterURL) {
    axios.get(characterURL).then(character => {
        // Resets the main container
        $("#main__container").empty();
        // Applying character info on the main container
        $("#main__container").append($("<div>").addClass("flex"));
        $(".flex").append($("<img>").attr("src",character.data.image));
        $(".flex").append($("<div>").css("margin-left","25px")
        .append($("<h2>").text(character.data.name))
        .append($("<p>").text(character.data.species+" | "+character.data.gender+" | "+character.data.status))
        .append($("<p>").text("Origin: "+character.data.origin.name).addClass("location")
        .click(() => {
                if (character.data.origin.name != "unknown") {
                    showLocation(character.data.origin.url)
                }
            }))
        );
        $("#main__container").append("<ul>");
        for (let i = 0; i < character.data.episode.length; i++) {
            // Getting the episodes info that this character is present
            axios.get(character.data.episode[i]).then(episode => {
                $("#main__container ul").append($("<li>").css("width","280px")
                .append($("<h3>").text(episode.data.name))
                .append($("<p>").text(episode.data.episode))
                .click(() => {
                    if (character.data.episode.length > 1) {
                        showEpisode(character.data.episode[i]);
                    } else {
                        showEpisode(character.data.episode);
                    }
                }));
            }).then(() => $("#main__container li").slideDown("slow","linear"));
        }
    });
}

function showLocation(locationURL) {
    axios.get(locationURL)
    .then(location => {
        // Resets the main container
        $("#main__container").empty();
        // Applying location info on the main container
        $("#main__container").append($("<h2>").text(location.data.name));
        $("#main__container").append($("<p>").text(location.data.type+" • "+location.data.dimension));
        $("#main__container").append($("<h4>").text("Residents"));
        $("#main__container").append("<ul>");
        for (let i = 0; i < location.data.residents.length; i++) {
            // Getting the residents info (image, name, specie, status) that lives on this location
            axios.get(location.data.residents[i]).then(resident => {
                $("#main__container ul").append($("<li>")
                .append($("<img>").attr("src",resident.data.image))
                .append($("<p>").text(resident.data.name))
                .append($("<p>").text(resident.data.species+" | "+resident.data.status))
                .click(() => showCharacter(resident.data.url))
                );
            }).then(() => $("#main__container li").slideDown(600,"linear"));
        }
    });
}
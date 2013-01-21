/*  
*   EXAMEN RIA - Janvier 2013
*   Réalisation d'une application mobile de suivi de séries
*   Rahir Justine - 2383
*/

(function ($) {
    "use strict";

    // --- global vars
    var $keyAPI = "b19f83116635";

    // --- methods

    // RECHERCHE UNE SERIE
    var searchSerie = function(e){
        var $search = $('#rechercher'); // On affecte l'input d'id 'rechercher' à la variable SEARCH
        $search.on('click', listResults); // Lorsque l'on clique sur 'rechercher' on affiche la liste des résultats
    };

    // AFFICHE LISTE DES RESULTATS DE LA RECHERCHE
    var listResults = function(e){
        e.preventDefault();
        var $addSerie, 
            $recoverValue = $( "#recherche-serie" ).val(); // On récupère la valeur tapée dans l'input 'rechercher-serie'
        
        if ( $recoverValue !== 0 && $recoverValue.length > 2 ) { // Si la valeur récupérée dans l'input n'est pas vide et si elle à une longueur strictement plus grande à 2 caractères
            $.ajax(
               {
                    url : "http://api.betaseries.com/shows/search.json?title=" + $recoverValue + "&key=" + $keyAPI,
                    type : "get",
                    dataType : "jsonp",
                    success : function(listResults) {
                        $('#resultats').show(); // Affiche le div d'id 'resultats'

                        $( "#resultats li" ).remove(); // Supprime le résultat déja trouvé et le remplace par le nouveau
                        for( var i = 0; i < listResults.root.shows.length; i++ ) { // Boucle or qui parcours la liste des résultats de la recherche               
                            // On créé un 'li' dans l'ul déjà créé à la base et on ajoute un bouton pour pouvoir ajouter la série
                            $( "<li  class='" + listResults.root.shows[i].url + "'><span>" + listResults.root.shows[i].title + "</span><a href='#' class='" + listResults.root.shows[i].url + "'>Découvrir la série</a><button type='button' class='ajouter-serie' title='Ajouter cette série' id='"+i+"'>Ajouter</button></li>" ).appendTo( "#resultats ul" );                        
                        }
                        $addSerie = $('button.ajouter-serie'); // On affecte la variable 'addSerie' à la balise 'button' de class 'ajouter-serie'
                        $addSerie.on('click', addInFavoriteSeries); // Au clic sur le button de class 'ajouter-serie' on exécute la fonction 'addInFavoriteSeries'
                    }
                }
            )
        } else {
            $( "#resultats li" ).remove(); // Sinon on supprime le li du div 'resultats'
            $( "<li id='pas-resultat'>Veuillez entrer 3 caractères minimum</li>" ).appendTo( "#resultats ul" ); // On créé un li dans l'ul déja créé dans le div 'resultats' qui dit à l'utilisateur qu'il faut au minimum 3 caractères pour lancer la recherche
        }
    }

    // STOCKE LA SERIE DANS LE LOCALSTORAGE
    var addInFavoriteSeries = function(e){
        e.preventDefault();
        $('#ajouter-serie').hide(); // Cache le div d'id 'ajouter-serie'
        var object = $(this); // Sélectionne le bouton d'ajout de la série sur lequel on vient de cliquer pour exécuter la fonction
        var $serieURL = object.parent().attr("class"); // On créé la variable 'serieURL'. On lui affecte la valeur de la classe du li créé lors de l'affichage des résultats cad l'url de la série 
        
        listFavoriteSeries( $serieURL , function (infoSerie) { // Exécute la fonction pour ajouter les données récupérée sur betaseries pour les mettre dans le localStorage
            window.localStorage.setItem( "JR_" + $serieURL , JSON.stringify(infoSerie) ); // Enregistre l'url de la série ajoutée dans le localStorage et transformée en chaine de caractères
        });
    };

    // AJOUTE LA SERIE GRACE AUX INFOS DE BETASERIES
    var listFavoriteSeries = function(urlSerie, sucessCallback){
        $.ajax(
        {
            url: "http://api.betaseries.com/shows/display/" + urlSerie + ".json?hide_notes=1&key=" + $keyAPI,
            type: 'get',
            dataType:'jsonp',
            success : function(infoSerie){
                sucessCallback.apply(null, [infoSerie]); // Grâce sucessCallback je passe ce que j'ai récupérer de betaseries

                $('#mes-series').show(); // Affiche le div d'id 'mes-series'
                displaySeries(); // Exécute la fonction 'displaySeries'
            }
        })
    };

    // AFFICHE LE NOM DE LA SERIE
    var displaySeries = function(e){
        $('.liste-series li').remove();
        
        for( var infoSerie in window.localStorage ){  // Boucle for qui parcours le localstorage
            if( infoSerie.substring( 0 , 3 ) === "JR_"){
                var dataSerie = JSON.parse( window.localStorage.getItem(infoSerie));
                var imgSerie = dataSerie.root.show.banner;
                $('.liste-series').append( "<li id='" + infoSerie + "'><div class='supprimer-serie'><p>Êtes-vous sûr de vouloir supprimer cette série ?</p><button id='oui'>Oui</button><button id='non'>Non</button></div><a href='#' class='" + dataSerie.root.show.url + "'>" + dataSerie.root.show.title + "</a><p class='duree-episode'>Episodes de : " + dataSerie.root.show.duration + "min</p><button name='" + dataSerie.root.show.url + "' id='" + infoSerie + "' class='delete' title='Supprimer cette série'>Supprimer</button><img alt='imgSerie' width='285px' src='"+ imgSerie + "'/></li>");
                $('.supprimer-serie').hide();
                
                if(imgSerie = 'undefined'){
                    imgSerie = '../img/banniere-defaut.png';
                }
            }
        }
        $(this).parents('.supprimer-serie').hide();
    };

    // SUPPRIME LA SERIE
    var deleteSerie = function(e){
        var nomSerie = $(this).attr("name");
        $(this).prev().prev().prev().show();
        var $keySerie = $(this).parents("li").attr("id"); // Je créé une variable 'keySerie' et qui a pour valeur l'id du li créé dans 'displaySeries' cad 'infoSerie'
            
        $('#oui').on('click',function(){
            $(this).parents("li").slideUp( function() { // Sélectionne la balise 'li' parent du button de class 'delete'
                $(this).remove(); // Supprime le li
            });
            window.localStorage.removeItem($keySerie); // Supprime la clé correspondante dans le localStorage
        });
        $('#non').on('click', function(){
            $(this).parents('.supprimer-serie').hide();
        });
    };

    // AFFICHE LE MENU
    var displayMenu = function(e){
        $('#menu').show(); // Affiche la balise d'id 'menu'
        $('.menu').hide(); // Cache la balise de class 'menu'
        $('#content').animate({ // Déplacement du contenu de 270px vers la droite en ajoutant une margin-left
           marginLeft : "270px"});
    };

    // AFFICHE LES INFOS SUR LA SERIE
    var discoverSerie = function(e){
        $('#decouvrir-serie').show(); // Affiche la balise d'id 'decouvrir-serie'
        $('#ajouter-serie').hide(); // Cache la balise d'id 'ajouter-serie'

        var $serieURL = $(this).attr("class"); // créé une variable 'serieURL' et lui affecte la valeur de la classe du lien 'découvrir la série' cad l'url de la série

        $.ajax({
                url : "http://api.betaseries.com/shows/display/" + $serieURL + ".json?" + "&key=" + $keyAPI,
                type : "get",
                dataType : "jsonp",
                success : function ( infoSerie ) {
                    $('#decouvrir-serie').find('h4').text(infoSerie.root.show.title); // Trouve le h4 du div d'id 'decouvrir-serie' et lui ajoute le titre de la série
                    $('#decouvrir-serie').find('img').attr({ src : infoSerie.root.show.banner ,  alt : infoSerie.root.show.banner});
                    $('#decouvrir-serie').find('#description').text( infoSerie.root.show.description);
                    $('#decouvrir-serie').find('.genre').text(infoSerie.root.show.genres);
                    $('#decouvrir-serie').find('.statut').text('Statut : ' + infoSerie.root.show.status);
                    $('#decouvrir-serie').find('.chaine').text('Diffusé par : ' + infoSerie.root.show.network);
                }
        });
    };

    // AFFICHE LE PLANNING
    var displayPlanning = function(e){
        $('#planning').show(); // Affiche la balise d'id 'planning'
        $('#mes-series').hide(); // Cache la balise d'id 'mes-series'
        $('#ajouter-serie').hide(); // Cache la balise d'id 'ajouter-serie'
        $('#menu').hide(); // Cache la balise d'id 'menu'

        $.ajax({
            url:'http://api.betaseries.com/planning/general.json?&key=' + $keyAPI,
            type:'get',
            dataType:'jsonp',
            success:function(displayPlanning) {
                if( $.isEmptyObject( window.localStorage ) ) { // Si aucune série n'est ajoutée 
                    $("#planning").find(".aucun-resultat").text("Aucune série n'a été ajoutée à votre planning.").show(); // On affiche un text dans le '.aucun-resultat' déjà créé
                }

                for(var i=0 ; i<displayPlanning.root.planning.length ; i++){ // Boucle for qui parcours le planning de betaseries
                    var n=0, maSerie=[];
                    
                    for( var infoSerie in window.localStorage){ // Boucle for qui parcours le localstorage
                        if(infoSerie.substring(0,3) === "JR_"){
                            
                            maSerie[n] = infoSerie.split("_");

                            if(displayPlanning.root.planning[i].url === maSerie[n][1]){ // Comparaison entre le planning et les séries enregistrées dans le localstorage
                                // Créé les variables qui vont me servir à afficher les détails du planning
                                var date = new Date( displayPlanning.root.planning[i].date * 1000 );
                                var date2 = new Date();
                                var currentDate = date2.getTime();
                                var months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
                                var month = months[date.getMonth()];
                                var day = date.getDate();
                                var justDate = day + " " + month;

                                $('.aucun-resultat').hide();
                                // Créé les balises dans le div d'id 'planning' avec les infos nécessaires au planning cad la date, l'épisode, la saison
                                $('#planning ul').append("<li><date class='date'>" + justDate + "</date><div><h6>" + displayPlanning.root.planning[i].show + "</h6><p>S" + displayPlanning.root.planning[i].season + "E" + displayPlanning.root.planning[i].episode + " - <span>" + displayPlanning.root.planning[i].title + "</span></p></div></li>");
                                
                                if (date < currentDate){
                                    $('.date').parents("li").css('opacity','0.3');
                                }
                            }
                        }
                    }
                }
            }
        });
    };

    var discoverSeason = function(e){
        alert('Afficher les différentes saisons mais ça ne marche pas')
        $('#saisons').show();
        var $serieURL = $(this).attr('class');
        var displaySeason = function (urlSerie,successCallback){
            $.ajax({
                url : "http://api.betaseries.com/shows/display/" + $serieURL + ".json?&key=" + $keyAPI,
                type : "get",
                dataType : "jsonp",
                success : function (infoSerie) {
                    for ( var i = 0; i < infoSerie.root.show.seasons.length; i++ ) {
                        $('#saisons').find('p').text(infoSerie.root.show.seasons[i]); 
                        console.log(infoSerie);
                    }
                    successCallback.apply(null , [infoSerie]);
                }
            });
        };
    };

    // ANIMATION DU CONTENU LORS DE LA FERMETURE DU MENU
    var animateContent = function(e){
        $('#content').animate({
            marginLeft : "0px"});  // Remet le contenu à sa position initiale
        $('.menu').show(); // Affiche la balise de class 'menu'
        $('#menu').hide(); // Cache la balise d'id 'menu'
    };

    $( function () {
        // --- onload routines

        // Au départ les div ci dessous sont cachés
        $('#decouvrir-serie').hide();
        $('#ajouter-serie').hide();
        $('#mes-series').hide();
        $('#a-propos').hide();
        $('#planning').hide();
        $('#saisons').hide();

        $('#recherche-serie').val() == '';

        // Lorsque le document est prêt je laisse le div 'home' affiché pendant un certain temps puis j'affiche le div 'ajouter-serie'
        $(document).ready(function(){
            $('#home').delay(1500).animate({ // Le div 'home' disparaît après un délai de 1500 et remonte vers le haut de la page
                marginTop: "-320px"});
            $('#ajouter-serie').delay(1500).fadeIn(); // Le div 'ajouter-serie' apparait après un délai de 1500
            searchSerie();
        });

        // Au clic sur '.retour' je cache le div 'decouvrir-serie' et j'affiche le div 'ajouter-serie'
        $('.retour').click(function(){
            $("#decouvrir-serie").hide();
            $("#ajouter-serie").show();
        });

        $('.mes-series').click(function(){
            $('#mes-series').show();
            $('#planning').hide();
            $('#ajouter-serie').hide(); 
            $('#a-propos').hide();

            animateContent();
        });

        $('.explorer').click(function(){
            $('#ajouter-serie').show();
            $('#mes-series').hide();
            $('#planning').hide();
            $('#a-propos').hide();

           animateContent();
        });

        $('.a-propos').click(function(){
            $('#a-propos').show();
            $('#ajouter-serie').hide();
            $('#mes-series').hide();
            $('#planning').hide();

            animateContent();
        });

        $('.planning').click(function(){
            $('#planning').show();

            animateContent();
            displayPlanning();
        });

         $('p.ajouter-serie').click(function(){
            $('#ajouter-serie').show();
            $('#mes-series').hide();
            $('#planning').hide();

            searchSerie();
        });

        // Au clic sur '.delete' du div 'mes-series' j'exécute la fonction deleteSerie = je supprime une série
        $('#mes-series').on('click','.delete',deleteSerie);

        // Au clic sur 'a' du div 'resultats' j'exécute la fonction discoverSerie = j'affiche la fiche d'une série
        $('#resultats').on('click','a',discoverSerie);

        $('.liste-series').on('click', 'a', discoverSeason);

        // Au clic sur '.menu' j'exécute la fonction displayMenu = j'affiche le menu
        $('.menu').on('click',displayMenu);
    });
}(jQuery));

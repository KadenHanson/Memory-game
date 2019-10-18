// Reusable game class, main class for the game rules
class Game {
    // Sets up default values
    constructor(mode) {
        this.score = 0;
        this.time = this.setTime(mode);
        this.cards = [];
        this.shuffledCards = [];
        this.matchedPairs = [];
        this.mode = mode;
        this.numberOfMoves = 0;
    }

    // Determines what the time limit for the game is based on the mode selected
    setTime(mode) {
        switch (mode) {
            case '4x4':
                return 120;
            case '6x6':
                return 250;
            case '8x8':
                // nice
                return 420;
            default:
                return 120;
        }
    }

    // Starts the game timer
    startTimer() {
        this.timer = setInterval(() => {
            if (this.time == 0) {
                this.stopTimer();
                alert('You lose!');
                $('#cards').css('pointerEvents', 'none');
            } else {
                this.time -= 1;
            }
            $('#timer').html(this.time);
        }, 1000);
        $('#timer').html(this.time);
    }

    // Stops the game timer
    stopTimer() {
        clearInterval(this.timer);
    }

    // Creates an array of cards and assigns the value to the this.cards variable, as well as running the funtion to create a shuffled deck to use for displaying the cards
    createCards(mode) {
        let _cards = [];
        let _shuffledCards = [];
        let count = 0;

        switch (mode) {
            case '4x4':
                count = 8;
                break;
            case '6x6':
                count = 18;
                break;
            case '8x8':
                count = 32;
                break;
            default:
                count = 8;
                break;
        }

        for (let value = 1; value <= count; value++) {
            let card_1 = new Card(value, 1, false, _cards.length);
            let card_2 = new Card(value, 2, false, _cards.length + 1);
            _cards.push(card_1, card_2);
            _shuffledCards.push(card_1, card_2);
        }

        this.shuffledCards = this.shuffleCards(_shuffledCards);
        return this.cards = _cards;
    }

    // Takes in the array of cards, shuffles them around, then updates the value of the this.shuffledCards variable with the result
    shuffleCards(_cards) {
        var cards = _cards;
        cards.sort(() => Math.random() - 0.5);

        return cards;
    }

    // Checks if 2 cards are a match
    isMatch(card_1, card_2) {
        if (card_1.value == card_2.value) {
            return true;
        }

        return false;
    }

    // Handles the process of flipping 2 cards and matching them if needed
    handleMove(_card_1, _card_2) {
        this.numberOfMoves++;
        let card_1 = this.cards[_card_1.index];
        let card_2 = this.cards[_card_2.index];

        if (!this.isMatch(card_1, card_2)) {
            return false;
        }

        this.cards[_card_1.index].faceUp = true;
        this.cards[_card_2.index].faceUp = true;

        // Moves the cards to the this.matchedPairs variable, this allows us to check how many pairs have been matched
        this.matchedPairs.push({ card_1: card_1, card_2: card_2 });

        this.handleScore();
        this.checkForWin();

        return true;
    }

    // Checks if the player has won the game, and handles things that need to happen when they do
    checkForWin() {
        let pairsNeeded;

        switch (this.mode) {
            case '4x4':
                pairsNeeded = 8;
                break;
            case '6x6':
                pairsNeeded = 18;
                break;
            case '8x8':
                pairsNeeded = 32;
                break;
            default:
                pairsNeeded = 8;
                break;
        }

        if (this.matchedPairs.length == pairsNeeded) {
            alert('You win!');
            this.stopTimer();
            // Sets up the high score, or updates it if it already exists
            if (window.localStorage.getItem('high-score') == undefined || window.localStorage.getItem('high-score') == null) {
                let _highScore = {'4x4': '', '6x6': '', '8x8': ''};
                _highScore[this.mode] = this.score;
                window.localStorage.setItem('high-score', JSON.stringify(_highScore));
                $('.hi-score-container').show();
                $('#high-score').html(this.score);
            } else {
                if (JSON.parse(window.localStorage.getItem('high-score'))[this.mode] < this.score) {
                    let _highScore = JSON.parse(window.localStorage.getItem('high-score'));
                    _highScore[this.mode] = this.score;
                    window.localStorage.setItem('high-score', JSON.stringify(_highScore));
                    $('.hi-score-container').show();
                    $('#high-score').html(this.score);
                }
            }
        }
    }

    // Determines the score for the move and applies it to the score
    handleScore() {
        let _score = 50;
        let tileBonus = (16 - (this.cards.length / this.matchedPairs.length)) * 20;
        let timeBonus = (this.time / 4) * 2;
        let triesBonus = (48 - this.numberOfMoves) * 10;
        if (tileBonus < 0) { tileBonus = 0; }
        if (timeBonus < 0) { timeBonus = 0; }
        if (triesBonus < 0) { triesBonus = 0; }

        _score += Math.round(this.score + tileBonus + timeBonus + triesBonus);
        this.score = _score;

        return $('#score').html(_score);
    }
}

// This is all just to set up variables needed for the game
let currentGame;
let shuffledCards;
let selected_1;
let selected_2;
let selected_1_Id;
let selected_2_Id;

// Creates the game object and renders all of the cards for the game
function startGame(mode) {
    $('#main-container').addClass(mode);
    currentGame = new Game(mode);
    currentGame.createCards(currentGame.mode);
    shuffledCards = currentGame.shuffledCards;
    currentGame.startTimer();

    // Displays the cards in the page
    $(shuffledCards).map((i, card) => {
        $('#cards').append('<div id="' + i + '" onclick="cardClick(' + card.index + ', ' + i + ')" class="card"><img src="images/card-back.png" alt="' + card.index + '" /></div>');
    });
}

// Clears out any old info from a previous game and starts a new one
function newGame(mode) {
    if (currentGame != undefined) {
        $('#main-container').attr('class', '');
        $('#cards').html('').css('pointerEvents', 'unset');
        $('#score').html('0');
        clearValues();
        currentGame.stopTimer();
    }
    // Shows the high score if there is one
    if (window.localStorage.getItem('high-score') != undefined || window.localStorage.getItem('high-score') != null) {
        $('.hi-score-container').show();
        $('#high-score').html(JSON.parse(window.localStorage.getItem('high-score'))[mode]);
    }
    startGame(mode);
}

// Handles when cards are clicked to check if they are pairs
function cardClick(card, cardId) {
    if (selected_1 == null || selected_1 == undefined) {
        selected_1 = currentGame.cards[card];
        selected_1_Id = cardId;
        $('#' + selected_1_Id + ' img').prop('src', currentGame.cards[card].faceImage).addClass('selected');
        return true;
    }
    if (selected_2 == null || selected_2 == undefined) {
        selected_2 = currentGame.cards[card];
        selected_2_Id = cardId;
        $('#' + selected_2_Id + ' img').prop('src', currentGame.cards[card].faceImage).addClass('selected');
    }

    if (currentGame.handleMove(selected_1, selected_2)) {
        $('#' + selected_1_Id + ' img, #' + selected_2_Id + ' img').removeClass('selected').addClass('matched').parent().prop('onclick', '');
    } else {
        $('#' + selected_1_Id + ' img, #' + selected_2_Id + ' img').removeClass('selected');
        let selected_1_Id_copy = selected_1_Id;
        let selected_2_Id_copy = selected_2_Id;
        $('body').css('pointerEvents', 'none');
        setTimeout(function () {
            $('#' + selected_1_Id_copy + ' img, #' + selected_2_Id_copy + ' img').prop('src', 'images/card-back.png');
            $('body').css('pointerEvents', 'unset');
        }, 1000);
    }

    clearValues();
}

// Clears the values used in displaying cards and sending information to the game logic
function clearValues() {
    $('#' + selected_1_Id + ' img, #' + selected_2_Id + ' img').removeClass('selected');
    selected_1 = null;
    selected_2 = null;
    selected_1_Id = null;
    selected_2_Id = null;
}

// Shows the modal on page load
$('#game-modal').modal('show');
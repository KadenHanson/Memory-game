class Card {
    constructor(value, version, faceUp, index) {
        this.value = value;
        this.faceImage = 'images/' + value + '.png';
        this.version = value + '_' + version;
        this.faceUp = faceUp;
        this.index = index;
    }
}
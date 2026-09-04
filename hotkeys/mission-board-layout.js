window.VIDLIK_MISSION_BOARD = Object.freeze({
  background: 'assets/backgrounds/sectors-board.webp',
  cards: {
    1: { src: 'assets/cards/sector-01.webp', x: 5.7993265107323895, y: 12.573024810711631, w: 20 },
    2: { src: 'assets/cards/sector-02.webp', x: 28.56689371472617, y: 15.108066638505667, w: 20 },
    3: { src: 'assets/cards/sector-03.webp', x: 51.2, y: 11.359528143580453, w: 20 },
    4: { src: 'assets/cards/sector-04.webp', x: 73.70067093763065, y: 10.564962708449462, w: 20 },
    5: { src: 'assets/cards/sector-05.webp', x: 8.366217673821593, y: 53.070231391966274, w: 20 },
    6: { src: 'assets/cards/sector-06.webp', x: 31.5, y: 52.91349213088768, w: 20 },
    7: { src: 'assets/cards/sector-07.webp', x: 54.33177461656041, y: 49.36496724469296, w: 20 },
    8: { src: 'assets/cards/sector-08.webp', x: 76.43310628527382, y: 55.74852942243822, w: 20 }
  },
  threads: [
    { from: [1, 'right'], to: [6, 'top'] },
    { from: [1, 'right'], to: [3, 'left'] },
    { from: [1, 'right'], to: [5, 'top'] },
    { from: [3, 'right'], to: [5, 'top'] },
    { from: [3, 'top'], to: [7, 'top'] },
    { from: [3, 'right'], to: [8, 'top'] },
    { from: [4, 'bottom'], to: [7, 'top'] },
    { from: [4, 'top'], to: [8, 'top'] }
  ],
  anchors: {
    top:    { x: 0.50, y: 0.07 },
    right:  { x: 0.93, y: 0.50 },
    bottom: { x: 0.50, y: 0.93 },
    left:   { x: 0.07, y: 0.50 }
  },
  navigation: {
    ArrowLeft:  { 1:4, 2:1, 3:2, 4:3, 5:8, 6:5, 7:6, 8:7 },
    ArrowRight: { 1:2, 2:3, 3:4, 4:1, 5:6, 6:7, 7:8, 8:5 },
    ArrowUp:    { 1:1, 2:2, 3:3, 4:4, 5:1, 6:2, 7:3, 8:4 },
    ArrowDown:  { 1:5, 2:6, 3:7, 4:8, 5:5, 6:6, 7:7, 8:8 }
  }
});

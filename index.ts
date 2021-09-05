import 'phaser';


import Scenes from './scenes/scenes';

//config
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',//ゲーム画面を描画するcanvasを書き出す先
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: Scenes
};

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

export class CsvControl {
    constructor() {
    
    }

    /**
     * 指定パスのCSVの中身を配列で返却
     * @param InputFilePath 
     * @returns csvArr
     */
    ReadFileLine(InputFilePath:string) {
      let srt = new XMLHttpRequest();
      srt.open("GET", InputFilePath, false);
      try {
        srt.send(null);
      } catch (err) {
        console.log(err)
      }
  
      // 配列を用意
      let csvArr = [];
      // 改行ごとに配列化
      let lines = srt.responseText.split("\n");
  
      // 1行ごとに処理
      for (let i = 0; i < lines.length; ++i) {
        let cells = lines[i].split(",");
        if (cells.length != 1) {
          csvArr.push(cells);
        }
      }
      return csvArr;
    }
}

//HTMLがロードされた後にインスタンスを生成する
window.addEventListener('load', () => {
  const game = new Game(config);
});
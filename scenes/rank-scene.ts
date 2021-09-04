let buttonSound;

export default class RankScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'Rank',
    });
  }

    // ゲーム開始前に呼び出される。画像取得などをする
    preload () {
      // 画像フォルダから素材を取得
      this.load.image('themebg', '../assets/theme_bg.jpg'); // 背景
      this.load.image('titleRank', '../assets/title_rank.png');  // タイトル
      this.load.image('backButton', '../assets/back.png');      // バックボタン
      this.load.audio('buttonSound', '../assets/sound/button_on.mp3');      // メニュー押下音
    }


  create() {

    buttonSound = this.sound.add('buttonSound');
    // 背景の設定
    this.add.image(400, 300, 'themebg');

    // タイトルの設定
    this.add.image(400, 200, 'titleRank');

    // ランクリストの設定
    // 読み込み
    let array = this.ReadFileLine("../ranking.csv");

    var list = [];
    for (var i=0; i<array.length; i++){
      let strText = String(array[i]).split(",");
      list[i]= [];
      for(var j=0; j<2; j++) {
        list[i][j] = strText[j];
      }
    }
    // スコアの降順にソート
    list = list.sort(function(a,b){return(b[1] - a[1]);});
    
    // ランキングの文字スタートポジション
    let rankingStartPosition = 300;
    for (let i = 0; i < list.length; i++) {
      this.add.text(300, rankingStartPosition, String(i + 1) + "："+ String(list[i]).split(',').join(" "));
      rankingStartPosition = rankingStartPosition + 30;
    }
    
    const backButton = this.add.image(380, 520, 'backButton');
     

    //setInteractiveを呼ぶと動的なオブジェクトになる
    //入力系のイベントなどが有効化される
    backButton.setInteractive();

    //各アクションイベント
    backButton.on('pointerdown', function (pointer) {
      buttonSound.play();
      this.scene.start('Title'); // Titleに遷移
       }, this);

  }

  // ランキング情報読み込み
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
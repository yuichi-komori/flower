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
    this.add.text(300,360,'1, test1  123456789');
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
}
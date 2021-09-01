let buttonSound;
let runSound;
export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'Title',
    });
  }

    // ゲーム開始前に呼び出される。画像取得などをする
    preload () {
      // 画像フォルダから素材を取得
      this.load.image('themebg', '../assets/theme_bg.jpg'); // 背景
      this.load.image('title', '../assets/title_logo.png');  // タイトル
      this.load.image('menuStart', '../assets/menu_start.png');   // メニュースタート
      this.load.image('menuRank', '../assets/menu_rank.png');      // メニューランク
      this.load.audio('buttonSound', '../assets/sound/button_on.mp3');      // メニュー押下音
      this.load.audio('runSound', '../assets/sound/running_oto.mp3');      // ゲームへ移行音
    }


  create() {

    buttonSound = this.sound.add('buttonSound');
    runSound = this.sound.add('runSound');
    // 背景の設定
    this.add.image(400, 300, 'themebg');

    // タイトルの設定
    this.add.image(400, 200, 'title');

    // メニューの設定
    const menuStart = this.add.image(380, 350, 'menuStart');
    const menuRank = this.add.image(380, 440, 'menuRank');
   
    //setInteractiveを呼ぶと動的なオブジェクトになる
    //入力系のイベントなどが有効化される
    menuStart.setInteractive();
    menuRank.setInteractive();

    //各アクションイベント
    menuStart.on('pointerdown', function (pointer) {
      buttonSound.play();
      runSound.play();
      // 走る音待ち
      setTimeout(() => {
        this.scene.start('Main'); // Mainに遷移
      }, 3000);
    }, this);
    
    menuRank.on('pointerdown', function (pointer) {
      buttonSound.play();
      this.scene.start('Rank'); // Rankに遷移
    }, this);
    
  }
}
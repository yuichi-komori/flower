export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'Title',
    });
  }

  create() {
    // タイトルを生成
    const text = this.add.text(100, 100, 'おしたらStart');

    //setInteractiveを呼ぶと動的なオブジェクトになる
    //入力系のイベントなどが有効化される
    text.setInteractive();

    text.on('pointerdown', function (pointer) {
      this.scene.start('Main'); // Mainに遷移
       }, this);
  }
}
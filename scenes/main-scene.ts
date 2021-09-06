// 定数
const LIMIT_TIME = 30120000;     // 502分（8.3時間）[ms]
const GOAL = 101;                // ゴール地点 + 1 [m] ※本来は「42195 + 1」ですが、開発時はここで調整してください！
const PLAYER_WIDTH = 60;         // プレイヤー画像のwidth [p]
const GOAL_WIDTH = 372;          // ゴール画像のwidth [p]
let GOAL_X;                      // ※GOAL, PLAYER_WIDTH, GOAL_HALF_WIDTHにより、算出 [p]
let MAIN_WIDTH;                  // ※GOAL_Xにより、算出 [p]
const MAIN_HEIGHT = 600;         // メイン画面のheight
const WORLD_RECORD_SPEED = 5.67; // マラソンの男子世界記録[m/s]
const PLAYER_SPEED_X = 160;      // プレイヤーの速度(x) [p/s]
const PLAYER_SPEED_Y = 330;      // プレイヤーの速度(y) [p/s]
const ENEMY_SPEED_X = 160;       // 敵の速度(x) [p/s]
const ENEMY_SPEED_Y = 330;       // 敵の速度(y) [p/s]
const ENEMY_STEP_X = 500;        // 敵の間隔(x)
const ENEMY_BY_FRAME = 20;       // 敵の挙動不審具合[f] (低い：よく動く, 高い：あまり動かない)
const HIT_SPEED_X = 160;         // 衝突時の速度(x) [p/s]
const HIT_SPEED_Y = 200;         // 衝突時の速度(y) [p/s]


// ゲームオブジェクト
let timer;
let bgm;
let soundGoal;
let soundRun;
let soundJump;
let soundDamaging;
let player;
let playerDamaging = false;  // プレイヤーのState(ダメージ状態)
let enemies;
let coins;
let bombs;
let goals;
let platforms;
let cursors;
let score = 0;
let gameOver = false;
let timeText;
let scoreText;
let clearText;
let updateByFrame = 0;        // ※Update()で使用
let clearTime; // ランキングCSVに書き込む用


export default class MainScene extends Phaser.Scene {
  private acorn: Phaser.Physics.Arcade.Image;

  constructor() {
    super({
      key: 'Main'
    });

  }
  
  // ゲーム開始前に呼び出される。画像取得などをする
  preload () {
    // 画像フォルダから素材を取得
    this.load.audio('bgm', ['../assets/sound/main_bgm.mp3']); // BGM
    this.load.audio('soundGoal', ['../assets/sound/main_goal.mp3']); // ゴール音
    this.load.audio('soundRun', ['../assets/sound/main_run.mp3']); // 走る音
    this.load.audio('soundJump', ['../assets/sound/main_jump.mp3']); // ジャンプ音
    this.load.audio('soundDamaging', ['../assets/sound/main_damaging.mp3']); // ダメージ音
    this.load.image('sky', '../assets/main_background.png'); // 背景
    this.load.image('ground', '../assets/main_ground.png');  // 地面
    this.load.image('block', '../assets/main_block.png');   // 壁
    this.load.image('coin', '../assets/coin.png');      // コイン
    this.load.image('bomb', '../assets/bomb.png');      // 爆弾
    this.load.image('goal', '../assets/main_goal.png');      // ゴール
    this.load.image('backButton', '../assets/back.png');      // 戻るボタン
    this.load.spritesheet('player', 'assets/soldier_60x95.png', { frameWidth: 60, frameHeight: 95 }); // プレイヤー
    this.load.spritesheet('enemy', 'assets/enemy_65x81.png', { frameWidth: 65, frameHeight: 81 }); // 敵
  }

  // 初期化
  init(){
    gameOver = false;
    GOAL_X = this.convertMeterToX(GOAL) + PLAYER_WIDTH;
    MAIN_WIDTH = GOAL_X + GOAL_WIDTH;
  }

  // ゲーム開始時に呼び出される。背景やプレイヤーの配置をしたりする
  create(){
    this.cameras.main.setBounds(0, 0, MAIN_WIDTH, MAIN_HEIGHT);
    this.physics.world.setBounds(0, 0, MAIN_WIDTH, MAIN_HEIGHT);

    // タイマーをセット
    timer = this.time.addEvent({ delay: LIMIT_TIME, callback: () => {} }); 

    // BGMの設定
    bgm = this.sound.add('bgm',{ volume: 1, loop: true });
    bgm.play();

    // 効果音の設定
    soundGoal = this.sound.add('soundGoal',{ volume: 1 });
    soundRun = this.sound.add('soundRun',{ volume: 0.5, loop: true });
    soundJump = this.sound.add('soundJump',{ volume: 0.5 });
    soundDamaging = this.sound.add('soundDamaging', {volume: 1});

    // 背景の設定
    this.autoFill(0, 0, 800, 600, function(scene, x, y){
      scene.add.image(x, y, 'sky').setOrigin(0,0);
    });

    platforms = this.physics.add.staticGroup();

    // 地面の配置
    this.autoFill(0, 536, 800, 64, function(scene, x, y){
      platforms.create(x, y, 'ground').setOrigin(0,0).refreshBody();
    });

    // 壁の設定
    this.randomCreate(0, 443, 66, 157, function(scene, x, y){
      platforms.create(x, y, 'block').setOrigin(0, 0).refreshBody();
    });

    // ゴールの設定
    goals = this.physics.add.staticGroup();
    goals.create(GOAL_X, 381, 'goal').setOrigin(0,0).refreshBody();

    // プレイヤーの設定
    player = this.physics.add.sprite(0, 0, 'player');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.cameras.main.startFollow(player, true);

    this.anims.create({
      key: 'damaging',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 3,
      repeat: 1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'player', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
      key: 'up-right',
      frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
      frameRate: 3,
      repeat: 1
    });

    this.anims.create({
      key: 'up-left',
      frames: this.anims.generateFrameNumbers('player', { start: 9, end: 12 }),
      frameRate: 3,
      repeat: 1
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', { start: 13, end: 20 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { start: 21, end: 28 }),
      frameRate: 10,
      repeat: -1
    });

    // 敵の設定
    enemies = this.physics.add.group({
          key: 'enemy',
          repeat: Math.floor(GOAL_X / ENEMY_STEP_X),
          setXY: { x: ENEMY_STEP_X, y: 0, stepX: ENEMY_STEP_X }
    });
    
    enemies.children.iterate(function (enemy) {
          enemy.setBounce(0.2);
          enemy.setCollideWorldBounds(true);
    });
    
    this.anims.create({
      key: 'enemy-turn',
      frames: [{ key: 'enemy', frame: 0 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'enemy-up-right',
      frames: this.anims.generateFrameNumbers('enemy', { start: 1, end: 2 }),
      frameRate: 3,
      repeat: 1
    });

    this.anims.create({
      key: 'enemy-up-left',
      frames: this.anims.generateFrameNumbers('enemy', { start: 3, end: 4 }),
      frameRate: 3,
      repeat: 1
    });

    this.anims.create({
      key: 'enemy-right',
      frames: this.anims.generateFrameNumbers('enemy', { start: 5, end: 12 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'enemy-left',
      frames: this.anims.generateFrameNumbers('enemy', { start: 13, end: 20 }),
      frameRate: 10,
      repeat: -1
    });

    // ユーザからの入力イベントを取得するオブジェクト作成
    cursors = this.input.keyboard.createCursorKeys();

    // コインの設定 ※一旦、コメントアウトします
    // coins = this.physics.add.group({
    //     key: 'coin',
    //     repeat: 33,
    //     setXY: { x: 12, y: 0, stepX: 70 }
    // });

    // coins.children.iterate(function (child) {

    //     child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    // });

    // ボムの設定 ※一旦、コメントアウトします
    // bombs = this.physics.add.group();

    // タイム(プレイ時間)のテキスト設定
    timeText = this.add.text(16, 16, 'time: 0', { fontSize: '32px'});
    timeText.setScrollFactor(0);

    // スコア(進んだ距離)のテキスト設定
    scoreText = this.add.text(16, 48, 'score: 0', { fontSize: '32px'});
    scoreText.setScrollFactor(0);

    // 衝突判定の設定。地面は、コイン・プレイヤー・爆弾・敵と衝突する。これがないと地面を貫通してしまう
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(enemies, platforms);
    // this.physics.add.collider(coins, platforms);
    // this.physics.add.collider(bombs, platforms);

    // プレイヤーとコインが重なれば、collectCoin() を呼び出す
    // this.physics.add.overlap(player, coins, this.collectCoin, null, this);
    // this.physics.add.collider(player, bombs, this.hitBomb, null, this);
    this.physics.add.overlap(player, enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(player, goals, this.gameClear, null, this);
  }
  
  // ゲーム進行中に呼び出す
  update() {
    // ゲームオーバーになったら処理終了(クリア時もここに入る)
    if (gameOver) {
      return;
    }

    // プレイヤーを更新
    if(playerDamaging){
      player.anims.play('damaging', true);
      // 1秒待機
      setTimeout(() => {
        player.setTint(0xffffff);
        playerDamaging = false;
      }, 1000);
    }
    else{
      // ←キー押下
      if (cursors.left.isDown) {
        player.setVelocityX(-PLAYER_SPEED_X);

        if(!player.body.touching.down){
          player.anims.play('up-left', true);
        }
        else{
          player.anims.play('left', true);

          if(!soundRun.isPlaying){
            soundRun.play();
          }
        }
      }

      // →キー押下
      else if (cursors.right.isDown) {
        player.setVelocityX(PLAYER_SPEED_X);

        if(!player.body.touching.down){
          player.anims.play('up-right', true);
        }
        else{
          player.anims.play('right', true);

          if(!soundRun.isPlaying){
            soundRun.play();
          }
        }
      }

      else {
        player.setVelocityX(0);

        soundRun.stop();

        if(!player.body.touching.down){ 
          player.anims.play('up-right', true);
        }
        else{
          player.anims.play('turn');
        }
      }

      // ↑キー押下
      if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-PLAYER_SPEED_Y);

        soundRun.stop();
        soundJump.play();
      }
    }
    
  
    // プレイ時間を設定
    let elapsedSeconds = timer.getElapsedSeconds();
    let minutes = Math.floor(elapsedSeconds / 60);
    let seconds = Math.floor(elapsedSeconds);
    timeText.setText('Time:  ' + ((minutes === 0) ? '' : minutes + "m ") + (seconds % 60) + 's');
    // CSVには秒の状態で書き込む(ソートしたいので)
    clearTime = elapsedSeconds;
    // 進んだ距離を設定
    score = this.convertXToMeter(player.body.position.x);
    let score_km = Math.floor(score / 1000);
    scoreText.setText('Score: ' + ((score_km === 0) ? '' : score_km + "km ") + (score % 1000) + 'm');

    // 敵を更新
    updateByFrame++;
    if(updateByFrame == ENEMY_BY_FRAME){
      enemies.children.iterate(function (enemy){
        let random_rate = Math.random();
        if(random_rate < 0.3){
          enemy.setVelocityX(-ENEMY_SPEED_X);

          if(!enemy.body.touching.down){
            enemy.anims.play('enemy-up-left', true);
          }
          else{
            enemy.anims.play('enemy-left', true);
          }
        }
        else if(random_rate < 0.6){
          enemy.setVelocityX(ENEMY_SPEED_X);

          if(!enemy.body.touching.down){
            enemy.anims.play('enemy-up-right', true);
          }
          else{
            enemy.anims.play('enemy-right', true);
          }
        }
        else if(random_rate < 0.9){
          enemy.setVelocityX(0);

          if(!enemy.body.touching.down){
            enemy.anims.play('enemy-up-right', true);
          }
          else{
            enemy.anims.play('enemy-turn');
          }
        }
        else{
          if(enemy.body.touching.down){
            enemy.setVelocityY(-ENEMY_SPEED_Y);
          }
        }
      });

      updateByFrame = 0;
    }
  }
  
  // // コインと接触した時
  // collectCoin(player, coin): void{
  //     // コインを消す
  //   coin.disableBody(true, true);

  //   // スコアを加算してスコアのテキスト更新
  //   score += 10;
  //   scoreText.setText('Score: ' + score);

  //   if (coins.countActive(true) === 0) {
  //       //  A new batch of coins to collect
  //       coins.children.iterate(function (child) {

  //           child.enableBody(true, child.x, 0, true, true);

  //       });

  //       let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

  //       let bomb = bombs.create(x, 16, 'bomb');
  //       bomb.setBounce(1);
  //       bomb.setCollideWorldBounds(true);
  //       bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  //       bomb.allowGravity = false;
  //   }
  // }

  // // 爆弾と接触した時
  // hitBomb(player, bomb){
  //   this.physics.pause();
  //   player.setTint(0xff0000);
  //   player.anims.play('turn');
  //   gameOver = true;
  // }

  // 敵と接触したとき
  hitEnemy(player, enemy){
    soundDamaging.play();
    player.setTint(0xff0000);
    player.setVelocityX(-HIT_SPEED_X);
    player.setVelocityY(-HIT_SPEED_Y);
    playerDamaging = true;
  }
  
  // ゴールと接触した時
  gameClear(){
    this.physics.pause();
    this.sound.stopAll();
    soundGoal.play();

    // GameClearのテキストを表示
    clearText = this.add.text(GOAL_X - GOAL_WIDTH, 200, 'Game Clear', { fontSize: '100px'});

    const backButton = this.add.image(GOAL_X - GOAL_WIDTH / 2, 400, 'backButton');
    backButton.setInteractive();
    backButton.on('pointerdown', function (pointer) {
      this.sound.stopAll();
      this.scene.stop();
      this.scene.start('Title'); // Titleに遷移
       }, this);
    
    // クリアタイムをCSVに書き込み
    this.writeCsv();
    gameOver = true;
  }

  // --------------- ↓ Utility ---------------

  // 変換処理(Meter ⇒ pixel)
  convertMeterToX(meter: number): number{
    return Math.floor(meter * PLAYER_SPEED_X / WORLD_RECORD_SPEED)
  }

  // 変換処理(pixel ⇒ Meter)
  convertXToMeter(x: number): number{
    return Math.floor(x * WORLD_RECORD_SPEED / PLAYER_SPEED_X);
  }

  // autoFillする　(対象：背景, 地面, etc?)
  autoFill(origin_x: number, origin_y: number, width: number, height: number, func:(_scene: MainScene, x: number, y: number) => void){
    let scene = this;
    let i = 0;
    let x = origin_x;
    let y = origin_y;     // ※今回は横スクロールの為、基本変わらない

    while(x < MAIN_WIDTH){
      func(scene, x, y);
      i++;
      x = origin_x + width * i;
    }
  }

  // 無作為に出現させる　(対象：壁, etc?)
  randomCreate(origin_x: number, origin_y: number, width: number, height: number, func:(_scene: MainScene, x: number, y: number) => void){
    let scene = this;
    let i = 0;
    let x = origin_x;
    let y = origin_y;
    const x_rate = 0.5; 　// 出現率

    while(x < GOAL_X - 200){
      if(Math.random() < x_rate){
        func(scene, x, y);
      }
      i++;
      x = origin_x + width * i;
      // ランダムにy座標の値を変える
      y = origin_y + Math.floor(height * Math.random());
    }
  }

  // CSV書き込み
  writeCsv() {

    let rankData = this.getCurrentDate() + "," + clearTime + "\n";
    
  }

  // 現在日付取得処理(yyyy-mm-dd)
  getCurrentDate() {
    const date = new Date();
    return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
  }
}

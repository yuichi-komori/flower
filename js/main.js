// シーンの設定
let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// ゲーム開始
let game = new Phaser.Game(config);


// ゲーム開始前に呼び出される。画像取得などをする
function preload()
{
	// 画像フォルダから素材を取得
    this.load.image('sky', 'image/background.jpg'); // 背景
    this.load.image('ground', 'image/ground.png');  // 地面
    this.load.image('block', 'image/block1.png');   // 壁
    this.load.image('coin', 'image/coin.png');      // コイン
    this.load.image('bomb', 'image/bomb.png');      // 爆弾
    this.load.image('goal', 'image/goal.png');      // ゴール
    this.load.spritesheet('dude', 'image/dude.png', { frameWidth: 32, frameHeight: 48 }); // プレイヤー
}

// ゲームオブジェクト
let player;
let coins;
let bombs;
let goals;
let platforms;
let cursors;
let score = 0;
let gameOver = false;
let scoreText;
let clearText;

// ゲーム開始時に呼び出される。背景やプレイヤーの配置をしたりする
function create ()
{
    this.cameras.main.setBounds(0, 0, 2400, 600);
    this.physics.world.setBounds(0, 0, 2400, 600);
	
	// 背景の設定
    this.add.image(400, 300, 'sky');
    this.add.image(1200, 300, 'sky');
    this.add.image(2000, 300, 'sky');
    

    platforms = this.physics.add.staticGroup();
	
	// 地面の配置
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(1200, 568, 'ground').setScale(2).refreshBody();
    platforms.create(2000, 568, 'ground').setScale(2).refreshBody();

	// 壁の設定
	platforms.create(50, 520, 'block');
	platforms.create(600, 568, 'block');
	platforms.create(750, 530, 'block');
	
	// ゴールの設定
	goals = this.physics.add.staticGroup();
	goals.create(2000, 500, 'goal');

	// プレイヤーの設定
    player = this.physics.add.sprite(100, 450, 'dude');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.cameras.main.startFollow(player, true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

	// ユーザからの入力イベントを取得するオブジェクト作成
    cursors = this.input.keyboard.createCursorKeys();

    coins = this.physics.add.group({
        key: 'coin',
        repeat: 33,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    coins.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    bombs = this.physics.add.group();
	
	// スコアのテキスト設定
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    scoreText.setScrollFactor(0);

	// 衝突判定の設定。地面は、コイン・プレイヤー・爆弾と衝突する。これがないと地面を貫通してしまう
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(coins, platforms);
    this.physics.add.collider(bombs, platforms);

	// プレイヤーとコインが重なれば、collectCoin() を呼び出す
    this.physics.add.overlap(player, coins, collectCoin, null, this);
    this.physics.add.collider(player, bombs, hitBomb, null, this);
    this.physics.add.overlap(player, goals, gameClear, null, this);
}


// ゲーム進行中に呼び出す
function update()
{
	// ゲームオーバーになったら処理終了(クリア時もここに入る)
    if (gameOver)
    {
        return;
    }
	
	// ←キー押下
    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }
    
    // →キー押下
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

	// ↑キー押下
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }
}

// コインと接触した時
function collectCoin (player, coin)
{
	// コインを消す
    coin.disableBody(true, true);

	// スコアを加算してスコアのテキスト更新
    score += 10;
    scoreText.setText('Score: ' + score);

    if (coins.countActive(true) === 0)
    {
        //  A new batch of coins to collect
        coins.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        let bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }
}

// 爆弾と接触した時
function hitBomb (player, bomb)
{
	this.physics.pause();
	player.setTint(0xff0000);
	player.anims.play('turn');
	gameOver = true;
}

// ゴールと接触した時
function gameClear() {
	this.physics.pause();
	player.anims.play('turn');
	// GameClearのテキストを表示
	clearText = this.add.text(1650, 300, 'Game Clear', { fontSize: '100px', fill: '#000' });
	gameOver = true;
}
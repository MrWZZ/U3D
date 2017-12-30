require(["U3D"],function(U3D)
{
  var canvas = document.getElementById("canvas");
  var U = new U3D(canvas);

  // 游戏对象
  function Baby(x,y)
  {
    var width = 50;
    var height = 50;
    var url = "baby.png"
    U.Sprite.call(this,x,y,width,height,url);
    var self = this;
    self.z = 1;
    self.collisionWidth = 20;
    self.collisionHeight = 20;
    self.anchorX = 0.5;
    self.anchorY = 1;
    self.speed = 50;
    self.collisionTarget = ["Baby"];
    self.artist = { "default" : [{x:0,y:0,width:37,height:39},{x:38,y:0,width:37,height:39}] };
    self.behaviors =
    {
      "default":
      {
        bool: true,
        Execute: function()
        {
          if (!self.behaviors["default"].bool) { return; }
          var inSelf = self.behaviors["default"];
          self.x += U.Time.deltaTime * self.speed;
          self.angle += 1;
        }
      }
    };
    self.OnCollision2D = function(c) {self.speed = -self.speed};
    self.Add();
    self.animator.ChangeArtist("default",300);
  }

  // 游戏背景
  function Background()
  {
    var width = canvas.width;
    var height = canvas.height;
    var url = "bg.png";
    U.Sprite.call(this,canvas.width/2,canvas.height/2,width,height,url);
    var self = this;
    self.artist = { "default" : [{x:0,y:0,width:480,height:640}] };
    self.Add();
  }

  // 倒计时
  function CountDown(time)
  {
    U.Manage.call(this);
    var self = this;
    self.time = time;
    var addTime = 0;
    var timePanel = document.getElementById("time");
    self.Execute = function()
    {
      if(addTime > 1000)
      {
        self.time--;
        timePanel.innerHTML = "倒计时：" +  self.time;
        addTime = 0;
      }
      else
      {
        addTime += U.Time.deltaTime * 1000;
      }
    }
    self.Add();
  }

  // 初始化游戏
  U.GameInitial();
  // 生成游戏物体
  new Background();
  new CountDown(60);
  var b1 = new Baby(50,50);
  var b2 = new Baby(400,50);
  b2.speed = -b2.speed;
  // 更新游戏
  U.GameUpdate();

});

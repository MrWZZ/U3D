+ [Sprite](#sprite)
  + [Role](#role)
  + [Background](#background)
+ [Manage](#manage)
  + [CountDown](#count_down)
+ [TimeClass](#time_class)
+ [GameLink](#game_link)


<h1 id="sprite">Sprite</h1>

```js
U.Sprite = function(x, y, width, height, url)
{
  var self = this;
  self.x = x;                              // x坐标（中心点）
  self.y = y;                              // y坐标（中心点）
  self.width = width;                      // 宽度
  self.height = height;                    // 高度
  var image = new Image();       
  image.src = url;                         // 图片的路径
  self.speed = 0;                          // 移动的速度
  self.angle = 0;                          // 旋转的角度
  self.alpha = 1;                          // 透明度
  self.z = 0;                              // z轴高度（画布高度）
  self.anchorX = 0.5;                      // x轴锚点的位置
  self.anchorY = 0.5;                      // y轴锚点的位置
  self.collisionWidth = self.width;        // 碰撞体宽度
  self.collisionHeight = self.height;      // 碰撞体高度
  //此物体的碰撞体名称
  self.collisionType = self.constructor.name;
  //此物体需要和哪些物体进行碰撞检测，如：["Cat","Dog"]
  self.collisionTarget = [];
  //此物体每几帧才进行一次碰撞检测
  self.CHECK_FREQUENCY = 1;
  //碰撞时触发的方法,参数为碰撞的对象
  self.OnCollision2D = function(c) {};

  //动画帧（切割图片）
  self.artist =
  {
    //默认
    "default" : [{x:0,y:0,width:self.width,height:self.height}]
    //可在此添加更多的帧动画
  };
  var frames = self.artist["default"];     // 绘画的动画帧名字
  var frame = frames[0];
  var frameTime = 0;                       // 每一帧的时间
  var addFrame = 0;
  var frameIndex = 0;
  var endFrame = null;                     // 动画循环结束执行方法
  function FrameExecute()
  {
    if(frameTime == -1){return;}
    if(addFrame >= frameTime)
    {
      addFrame = 0;
      if(frameIndex == frames.length-1)
      {
        frameIndex = 0;
        //动画到最后一帧执行回调方法
        if(endFrame != null)
        {
          endFrame();
        }
      }
      else
      {
        frameIndex++;
      }
      frame = frames[frameIndex];
    }
    else
    {
      addFrame += U.Time.deltaTime * 1000;
    }
  }

  //行为
  self.behaviors =
  {
    //行为名称
    "default":
    {
      //本行为是否开启
      bool: false,                       
      Execute: function()
      {
        if (!self.behaviors["default"].bool) { return; }
        var inSelf = self.behaviors["default"];
        //行为具体执行代码
      }
    }
    //可在此添加额外行为
  };

  //动画控制者
  self.animator =
  {
    Execute: function()
    {
      for (var key in self.behaviors)
      {
        self.behaviors[key].Execute();
      }
    },
    //改变行为状态
    SetBool: function(behavior, bool)
    {
      self.behaviors[behavior].bool = bool;
    },
    //改变当前的动画帧
    ChangeArtist : function(name,time,callback)
    {
      frames = self.artist[name];       // 动画帧的名字
      frame = frames[0];
      frameTime = time;                 // 每一帧的时间
      endFrame = callback || null;      // 动画帧结束后的回调方法
    }
  };

  //实例化时需要调用此方法将此物体加入到游戏中
  self.Add = function()
  {
    self.animator.ChangeArtist("default",-1);
    if(self.collisionTarget.length != 0)
    {
      collisionList.AddWithType(self);
    }
    drawList.AddWithType(self);
  };

  //在游戏中删除此物体
  self.Destroy = function()
  {
    if(self.collisionTarget.length != 0)
    {
      collisionList.Delete(self);
    }
    drawList.Delete(self);
  };

  //在画布上绘制
  self.Draw = function()
  {
    canvas2D.save();
    canvas2D.globalAlpha = self.alpha;
    self.animator.Execute();
    canvas2D.translate(self.x, self.y);
    canvas2D.rotate(self.angle * Math.PI/180);
    FrameExecute();
    canvas2D.drawImage(image,frame.x,frame.y,frame.width,frame.height,
      -self.width / 2, -self.height / 2, self.width, self.height);
    canvas2D.restore();
  };
};
```

<h2>快速复制</h2>

<h3 id="role">Role</h3>

```js
function Role(x,y)
{
  var width = 50;
  var height = 50;
  var url = "role.png"
  U.Sprite.call(this,x,y,width,height,url);
  var self = this;
  self.z = 1;
  self.speed = 20;
  self.collisionTarget = ["Role"];
  self.artist = { "default" : [{x:0,y:0,width:37,height:39}] };
  self.behaviors =
  {
    "default":
    {
      bool: true,
      Execute: function()
      {
        if (!self.behaviors["default"].bool) { return; }
        var inSelf = self.behaviors["default"];

      }
    }
  };
  self.OnCollision2D = function(c) { };
  self.Add();
  self.animator.ChangeArtist("default",300);
}
```

<h3 id="background">Background</h3>

```js
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
```

<h1 id="manage">Manage</h1>

```js
U.Manage = function()
{
  var self = this;
  self.Execute = function()
  {
    //加入到游戏更新中的方法
  }
  self.Add = function()
  {
    gameManage.AddToLast(self);
  }
  self.Destroy = function()
  {
    gameManage.Delete(self);
  }
}
```

<h2>快速复制</h2>

<h3 id="count_down">CountDown</h3>

```js
function CountDown()
{
  U.Manage.call(this);
  var self = this;
  self.Execute = function()
  {
    //方法
  }
  self.Add();
}
```

<h1 id="time_class">TimeClass</h1>

```js
function TimeClass()
{
  var init = true;
  var now = 0;
  var lastFpsTime = 0;
  var lastUpdateTime = 0;
  //每秒更新的FPS
  this.fps = 0;
  //时间增量
  this.deltaTime = 0;

  this.Update = function()
  {
    now = new Date().getTime();
    //初始化
    if (init)
    {
      init = false;
      lastFpsTime = now;
    }
    else
    {
      var offset = now - lastFpsTime;
      this.deltaTime = offset/1000;
      //每隔一秒返回一个新的FPS
      if (now - lastUpdateTime > 1000)
      {
        lastUpdateTime = now;
        this.fps = (1 / offset * 1000).toFixed(0);
      }
      lastFpsTime = now;
    }
  }
}

(function TimeUpdate()
{
  U.Time.Update();
  requestAnimationFrame(TimeUpdate);
})();
```

<h1 id="game_link">GameLink</h1>

```js
function GameLink(type)
{
  var self = this;
  self.first = null;
  self.last = null;
  self.count = 0;

  //加到链表末尾
  self.AddToLast = function(o)
  {
    var addN = new Node(o)
    //链表是空的
    if(self.first == null)
    {
      self.first = addN;
      self.last = addN;
    }
    else
    {
      self.last.next = addN;
      addN.previous = self.last;
      self.last = addN;
    }
    self.count++;
  }

  //根据类型添加
  self.AddWithType = function(o)
  {
    var addN = new Node(o)
    self.count++;
    //如果链表是空的
    if (self.first == null)
    {
      self.first = addN;
      self.last = addN;
    }
    else
    {
      var findF = self.first;
      //比第一个小
      if (addN.data[type] <= findF.data[type])
      {
        addN.next = self.first;
        self.first.previous = addN;
        self.first = addN;
      }
      // 比第一个大
      else
      {
        while (findF.next != null)
        {
          if (addN.data[type] <= findF.next.data[type])
          {
            findF.next.previous = addN;
            addN.next = findF.next;

            findF.next = addN;
            addN.previous = findF;

            return;
          }
          else
          {
            findF = findF.next;
          }
        }
        //到达列表末尾
        addN.previous = findF;
        findF.next = addN;
        self.last = addN;
      }
    }
  }

  //删除
  self.Delete = function(o)
  {
    var findF = self.first;
    self.count--;
    //是第一个
    if (findF.data == o)
    {
      self.first = self.first.next;
      //如果链表只有一个
      if(self.first == null)
      {
        self.last == null;
      }
      else
      {
        self.first.previous = null;
      }
      return;
    }
    //不是第一个
    else
    {
      while (findF.next != null)
      {
        if (findF.next.data == o)
        {
          //该节点为末尾
          if (findF.next.next == null)
          {
            self.last = findF;
          }
          // 该节点不是末尾
          else
          {
            findF.next.previous = findF;
          }
          findF.next = findF.next.next;
          return;
        }
        else
        {
          findF = findF.next;
        }
      }
      self.count++;
      console.log("未找到该对象");
    }
  }

  // 打印链表内容
  self.Show = function()
  {
    var findF = self.first;
    do
    {
      console.log(findF);
      findF = findF.next;
    } while (findF != null);
  }
}

//节点
function Node(o)
{
  var self = this;
  self.data = o;
  self.previous = null;
  self.next = null;
}
```

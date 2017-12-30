define(function()
{
  function U3D(canvas)
  {
    var U = this;
    //全局时间对象
    U.Time = new TimeClass();
    //游戏时间控制器
    var gameTimer;
    //画布上下文
    var canvas2D = canvas.getContext("2d");
    //最长检测碰撞频率
    const CHECK_FRAME = 30;
    //当前频率计数器
    var gameFrame;
    //碰撞检测列表
    var collisionList;
    //绘画游戏列表
    var drawList;
    //游戏管理类
    var gameManage;

    //游戏初始化
    U.GameInitial = function()
    {
      collisionList = new GameLink("CHECK_FREQUENCY");
      drawList = new GameLink("z");
      gameManage = new GameLink();
      gameFrame = 0;
    }

    //游戏暂停
    U.GamePause = function()
    {
      if(gameTimer != null)
      {
        cancelAnimationFrame(gameTimer);
      }
    }

    //游戏恢复
    U.GameUpdate = function()
    {
      //防止重复开启此方法
      if(gameTimer != null)
      {
        U.GamePause();
      }
      _GameUpdate();
    }

    //游戏更新循环方法
    function _GameUpdate()
    {
      if(gameFrame != CHECK_FRAME) { gameFrame++; } else { gameFrame = 0; }
      GameDraw();
      CollisionChecked();
      gameTimer = requestAnimationFrame(_GameUpdate);
      GameManageExecute();
    }

    //执行所有游戏管理类方法
    function GameManageExecute()
    {
      var findF = gameManage.first;
      while(findF != null)
      {
        findF.data.Execute();
        findF = findF.next;
      }
    }

    //绘制所有对象
    function GameDraw()
    {
      canvas2D.clearRect(0,0,canvas.width,canvas.height);
      var findF = drawList.first;
      while (findF != null)
      {
        findF.data.Draw();
        findF = findF.next;
      }
    }

    //碰撞检测
    function CollisionChecked()
    {
      var findF = collisionList.first;
      while (findF != null)
      {
        if(gameFrame % findF.data.CHECK_FREQUENCY != 0){return;}
        var findN = findF.next;
        while (findN != null)
        {
          for(var key in findF.data.collisionTarget)
          {

            if(findF.data.collisionTarget[key] == findN.data.collisionType)
            {
              //可在此处添加当物体拥有旋转角度时调用另一种判断方式
              ConllisionCheck(findF.data,findN.data);
              break;
            }
          }
          findN = findN.next;
        }
        findF = findF.next;
      }
    }

    //不带旋转的方形碰撞检测
    function ConllisionCheck(col1,col2)
    {
      var x = Math.abs(col1.x - col2.x);
      var w = Math.abs((col1.collisionWidth + col2.collisionWidth)/2);
      var y = Math.abs(col1.y - col2.y);
      var h = Math.abs((col1.collisionHeight + col2.collisionHeight)/2);

      if(x < w && y < h)
      {
        col1.OnCollision2D(col2);
        col2.OnCollision2D(col1);
      }
    }

    //游戏管理类
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
          -self.width * self.anchorX , -self.height * self.anchorY, self.width, self.height);
        canvas2D.restore();
      };
    };

    //时间类
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
  }

  // 链表
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
    //o:被添加的对象
    //type:被添加的类型
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
    // o:被删除的对象
    // type:被删除的类型
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
  //Node
  function Node(o)
  {
    var self = this;
    self.data = o;
    self.previous = null;
    self.next = null;
  }

  return U3D;
});

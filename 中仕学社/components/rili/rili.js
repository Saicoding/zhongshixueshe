// components/errorRecovery/errorRecovery.js
const app = getApp()
const API_URL = 'https://xcx2.chinaplat.com/main/'; //接口地址
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    windowHeight: {
      type: Number,
      value: 1333
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    first: true,
    icons: [
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAPAAA/+EDc2h0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMzggNzkuMTU5ODI0LCAyMDE2LzA5LzE0LTAxOjA5OjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjgyNTc2NThFMzhDOTExRTlCNkIxQzExMkI5NzdBQTFBIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjc4MjQ5NjQ4NDA3ODExRTlBQjc3OTg1QzhBOTEwQUYxIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjc4MjQ5NjQ3NDA3ODExRTlBQjc3OTg1QzhBOTEwQUYxIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE3IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkE0M0IxRDlGNDA3NzExRTk5OEU2Q0E3NkFCRTJFQkJCIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkE0M0IxREEwNDA3NzExRTk5OEU2Q0E3NkFCRTJFQkJCIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+/+4ADkFkb2JlAGTAAAAAAf/bAIQABgQEBAUEBgUFBgkGBQYJCwgGBggLDAoKCwoKDBAMDAwMDAwQDA4PEA8ODBMTFBQTExwbGxscHx8fHx8fHx8fHwEHBwcNDA0YEBAYGhURFRofHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8f/8AAEQgAZABVAwERAAIRAQMRAf/EAJcAAQACAwEBAAAAAAAAAAAAAAAEBQEDBgIIAQEAAgMBAQAAAAAAAAAAAAAABAUBAwYCBxAAAgECAgYGCAYDAAAAAAAAAAECEQMxBEFRYRITBSGBkSIyFHGhscHRYnKyQiNDY3MGJDQVEQEAAQMCAwYFAwUAAAAAAAAAARECAyEEMRIFQVFxMkITYZHBIgbwgdHhYrIzFP/aAAwDAQACEQMRAD8A+nr1+UpNRdIr1gaQAAAAAAAAGU2nVOjA3eZlwvnrSuwDQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPMrkI4vqIGfqOPHpWstluKZeZX4xVZUitcnQgX9WnspDbGBrjncu3RXLbepTXxNcdXnvh7nbT3S28aP4lTaSLOrR6oa5w9z0mmqp1RaYdxZkitstN1sxxZNzyAAAACFmc8otwg8PFI43rHXvunFinSOMp2Db6VlS3+b37rcMk92ODvtVb+hP2spLL77lnbt7bdb/AJfyivKcSW/elK7N4ym3L2m2MNeLZ71NI0ZeRsU8C7EZ9iGPfuZt+cyrrlrsox025d6D6meJx3W8JZmbL/NCyyXN+K91rh5iKrK3imtcdZ4t3uTDdzRNEXLtqR32rjL5iF6NV4lijuOldUs3dlfXHGFVmwzZPwbS1aQABF5hmODl20+9LoiUf5Bv52+3nl81+kfVJ2uLnu+EOazl2dyay0X0PvXfRoifPNlh5p5pXuOIiOb5NluMYKiRe2WUabpq9nt5AAoI+Zst0uQe7cg6xktDI2fFExq3Y7+yeCby7PtOF7CvRcjtWKKzYbq7Z7mLuzt+MNO4wRMTa6JNNJrB4H1q26LoiY4SoZhkyAFLzy6/MW7ehRr2tr3HAfl+SZzWW9kW1+c/0Wuwt+2Z+Kmy3elcuvGUn8CDs7KWwssukRCUlRE9GZMAAAxLChi6NGYRbEty9dhodJL04FDv7NYlJu1iJdVy6455K1J6qdjaPpPQ8k37THM91PlMx9HPbm2mSUktWgA5/wDsEqZ6H8a+6RwH5ZZXcWz/AGfWVx0/yT4qzJPuNam/aRdrP2p2bilkpHAAAAxIguX+TN/LT1lNvdZhL9MOp5O68tsv6vuZ9A6BbTZ2fv8A5S5/ef7Z/XYmlwjMyi4yaeKAo/7NYfDtZlYQe5P0SwfajmPyba8+O3JHp0nwlZdOyazb3qHL3Ny808J9PXpOV219NFvdbW3wWCdUWUSiyyGAAB4u3FCDbPGS6kPdltZV0HKUqpVncaUVtfRFFXNk5L4iOM6JN8xHhDt8rYVjLWrK/Tio12pdJ9P22GMWO2yPTFHMZb+a6Z727de7vaK0N7wk5nhafHs94Fdn/LeSv+Z/19x8TXTZt1GjdcntXe55KatmHm545fNVwve3VXxaNdT5nNK6Oot4rPLcXcW8TMVaI+WldG/oJDSwAewxNSFfneLVb3g0kLNXtS8VKacUnkPA/wCpa42p8LVxNFeqtCy6F7f/AERzcfT4/rgib7m9qafv4Owju171abDu1CmfkcH9sD//2Q==',
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAPAAA/+EDc2h0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMzggNzkuMTU5ODI0LCAyMDE2LzA5LzE0LTAxOjA5OjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjhDREI1QTg4MzhDOTExRTk4RjZFQUE0ODUzOTEyMDU2IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjcyQjI3NkRFNDA3ODExRTlCRERFQUE3NTQ5N0ZCNDZEIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjcyQjI3NkRENDA3ODExRTlCRERFQUE3NTQ5N0ZCNDZEIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE3IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkExMDAwQUMzNDA3NzExRTk5MjJEOUIxNEM3MDJDMTlBIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkExMDAwQUM0NDA3NzExRTk5MjJEOUIxNEM3MDJDMTlBIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+/+4ADkFkb2JlAGTAAAAAAf/bAIQABgQEBAUEBgUFBgkGBQYJCwgGBggLDAoKCwoKDBAMDAwMDAwQDA4PEA8ODBMTFBQTExwbGxscHx8fHx8fHx8fHwEHBwcNDA0YEBAYGhURFRofHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8f/8AAEQgAZABVAwERAAIRAQMRAf/EAG0AAQADAQEBAAAAAAAAAAAAAAABAwQFAggBAQAAAAAAAAAAAAAAAAAAAAAQAAIBAgMFBgQHAAAAAAAAAAABAhEDIRIEMUFRYRORscEiMgVxgaEU8UJicoIjYxEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A+nr1+UpNRdIr6gUgAAAAAAAAJTadU6MC77mXS/XWleQFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlR4uiA9pW0se14ARnscY9oEtW3y+oHhxpjtXECAAAAAApvamFt02y7gKfubs8Ibd8mA6Lk63G5Pm/AB9vb4LsAdKcMbcnHlu7AC1U4uk8JcdzA0Wr8LqwwktqAsAAAK791WrUp71s+IHKtqV2423zYHQhBRQHoAAA8XbalFgYFOdi8mns7gOxCSlFSWxqoEgAMPukmoW47m2+z8QK9FHy14gawAAAAAwa2NGmBs9um5afH8ra8QNQADB7qq9L+XgB50T8iA1AAAAABi1rwpzA0+2Kmnl+59yA1gTKLjJp7UBl19vNYzb4Ovy2MDHp55JU4gbk6oAAAARJ0QGC9LPOu5AdLS2+nYjF7dr+LxAuyvLm3VoBp1PS3+vl4gZJZaOvp314Ach5avL6avLxpuA12M+XEC4AAAo1GemGzeBRZ6fVhn9FcfADrRy181acgNn9HR/zA//2Q==',
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABkCAMAAADADYxgAAAAA3NCSVQICAjb4U/gAAABhlBMVEX////y8vLy8vLy8vLy8vLy8vLy8vLy8vLx8fHt8e/v8e/u8u/r8e3r7+zt7e3l8Onp7+vi8Ofj8Ojn7+re7+Td7+Pb7eLa7eHX7t/U7d3k5uXT69zP6tnP69nU6dvJ7dXM6dfJ6tXH6dPG6NPB6tC+6M286My558q558m358iz6Ma75su058ew6MS35ci15cau58Oz5cWw5cOt58Gx5cSq5r+s5cGp57+64Mim5r234Mep5b2o472j5bqd47ae4baa4rSZ4bOX4rKS4q+V4bCP4a2K4aqR362O36uI4aiM36qH36eJ36iB4KOF36V635583p973Z9135t/2qB23Zt43Z1y3Zlv3Zdw3Jdz2Zlr3JRs3JRp25Jo25Fl25Bn25Fg241e3Ixj249c24pe24ta24hZ2ohY2oZV2oVS2YNQ2oJQ2YJO2oFI2n1N2YBM2X9K2X5H2XxI2XxE2XpE2XlG2Xo/2XZC2XlA2Xc72XQ62HM42HIy2G402G812HAw2G0v2Gws2GrAlj53AAAAgnRSTlMARGZ3qt3u////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////yxk1EwAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAwMy8wOS8xOTL6O5IAAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzbovLKMAAACsElEQVRoge2a7VcSQRSHFwQGCiTMzEwrU0rK3jSzFwvJ7G1TQ02yTCnSMiWXQKtlUfc/795Zlh1grYVdvnTmfljuvb87z87Ozsw5nFlBoOb2+Ih983ncgmEurwNIzbwuHdrmGBOtrRXQMtblMJQQHATnxlQ3L7x9x6GEuAVPC6gewYl5Wms+oQVQQjiVUzmVUzn1P6FGprdVJTNhqnWJklJYjDZMPZ7YOVTBSulLdZr/8Q+UVDnV1xi1b1Ot2Kvajm5UpIMnjVCH9lXGXldpp3Ks9sY6NarQFhsvRYk6s4wW3sFMMZlIasOwZJV6WsZyaQhcf5ze4I4hrmL85Sx4gQTVRIvUNBavndSCqzgYxS5de4Ra+pgWDOxhVP86zagxLP1QCW9juKo/Bt5DOqFrvUUM/Vao+IzZkBHPIjam+e/AVS4Y2nXULlugBn5B4QibyELiO+3QRYQ8Z6vfQ2LGArUTnkoOsZlbyHqA3idwcgFWG4HMWwvUELyC0pmq1Dp2Fn77a+YD2BxkkhaoZAUKv3WzmWh59FLws8UKARGVG1aoA3SaT3Uwqa90GnTi/GS2m+D4NpZuWpoD5BldNL/nY2E9M4FrPjgJ13x5qpJwbK5A64q9dQDzFRuXtUUup5/GumlPcHVOZeASh6Dj/OhMpljeCLbO1bevpgYHx+6BjV9ZPDS2pZ/r8y8efgavdACX1NLHrMzsLnuJa9BibDB4JHV0V23adm8eQR1unok2bEqN5P7d8m+Wi5hRRXtQdktkqJJdqmRGLdilFsyoebvUPKdyKqdyKqdyKqdyKqdyKqdyKqe2muprAdXHnEY6R/UwJ6fOUd3MKa9j/4697Im0Y311safna3apKxqn+lD+fskedP8uC9W/SmhfsEddaCfsVwn6FxQ9y0rzTGW5x/iC4g/zFW15DdhdrQAAAABJRU5ErkJggg==",
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABkCAMAAADADYxgAAAAA3NCSVQICAjb4U/gAAAASFBMVEX////y8vLy8vLy8vLy8vLy8vLy8vL////7+/v4+Pj29vby8vLx8fHv7+/t7e3r6+vp6enn5+fl5eXj4+Ph4eHf39/d3d3b29sF0RDGAAAAGHRSTlMARGZ3qt3u//////////////////////+lxhoyAAAACXBIWXMAAAsSAAALEgHS3X78AAAAFnRFWHRDcmVhdGlvbiBUaW1lADAzLzA5LzE5Mvo7kgAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAK0SURBVGiB7drrsoIgEABg61SW3OQivv+bngDRVVcTpZkzZ9x/RXxty4pOWhQ+rrcHOR6P27UY4nLPQIa4XyL6k8108fMNtGMvmVFCXBHy1TTG/b362VFCrsXtC+qtyNGn03gUX0AJOdVTPdVTPdV/olJpWmvEwlhjG8XT1bppXViNzI1jiqWpzLR9yGmiw5itU1Ru23aJpQ0cU9vVDjVSNTM2ZGpVHMNYVKUebdxC0dpPBbXVfswVlEq0QEuqn2hoeCHcV1gaxwQcC79pvpyYyv3E/qV3NPwZTf8dnjVTAFX1aCIhCiSkJskJNFlMdasAm98vekiIzdZHY5VFVPcjLYXv+IRENOZjszbYpJKYrE913Phyo0pcQ+p5sjxUtRl9tm4n5VpUed+to2RVaACYKg/NSycA3q8qHFn1sHe4lKxPeagNq7v9YFu/Rra1jRSd7LIU/XpTJpTptgqL7JUTlbIQatiVGq1qwXwPO0fWUhuw99jaT6DLKtPx46MtC32jHwgjVrMFlS1O3RKW4ar5PHUtDKrWx1DYc0W2VGGyQG0+z1uP5lRP9b+qivOqqsoQVRX2/6OqKafx5MdVNVPfLppvisoRtSwxNkUlqFoiO3yK+sJVpLYpKo6Wr0Pqe7GeFZdKKTGuxSFViuEcYZ651FHwXBUYBagBy6bCAwI5d+5T9Xpj7VMhilR1nwrRJ3rttEOFKLoL7FEtOHBfC1d56Sr5jKarZgOartYb0HR1OFQXz1o71L6s1cqHktV4ii1FTrXmXaxdOv+Bq4zW/csSY2WxktWhBXKu1qAuXLb8IZV8Ra2+rOY8CobrALX8Iag+tqhlmvoAdyPzHVs3cOc0n3oFd3mzqXd4RzqbeoF3z3Op45vya9vRptAQjU8l8EN/5ry3S/dv2fBUQnyCQh5T5fAExS/BNws1BkgisAAAAABJRU5ErkJggg=='
    ],
    qiandaos: new Array(30),
    SignDays: 0,
    SignHeadImgs: [
      '/images/avatar.png',
      '/images/avatar.png',
      '/images/avatar.png',
      '/images/avatar.png',
      '/images/avatar.png',
      '/images/avatar.png'
    ],
    ksDate: 0 //还剩多少天
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //隐藏弹框
    hideDialog() {
      this.setData({
        isShow: false
      })
    },
    //展示弹框
    showDialog(self) {
      let user = wx.getStorageSync('user');
      let zcode = user.zcode ? user.zcode : '';
      let token = user.token ? user.token : '';
      let qiandaos = this.data.qiandaos;
      let that = this;

      that.setData({
        isShow: true,
      })

      wx.showShareMenu({
        withShareTicket: true,
        success: function(e) {
        }
      })

      this.initQiandao();

      app.post(API_URL, "action=QianDao&zcode=" + zcode + "&token=" + token, false, false, "", "", false, self).then(res => {
        console.log(res)
        let result = res.data.data[0];
        let SignDays = result.SignDays;//连续签到
        let SignHeadImgs = result.SignHeadImg ? result.SignHeadImg :'/images/avatar.png';
        let SignNums = result.SignNums?result.SignNums:1;
        let SendJifen = result.SendJifen;
        let SignTotalDays = result.SignTotalDays;
        let money = result.money;

        let current = SignDays - 3 <= 0 ? 0 : SignDays - 3;
       
        that.setQiandao(SignDays);
       
        if (SendJifen) {
          let myDate = new Date(); //获取系统当前时间
          let year = myDate.getFullYear();
          let month = myDate.getMonth() + 1;
          let day = myDate.getDate();
          let interval = self.data.interval;

          if (SignDays * 1 == 7) {
            SendJifen = SendJifen*1 + 100;
          } else if (SignDays * 1 == 15) {
            SendJifen = SendJifen * 1 + 200;
          } else if (SignDays * 1 == 30) {
            SendJifen = SendJifen * 1 + 500;
          }

          user.Money = money;  
         
          self.clear();

          myDate = "" + year + month + day; //得到当前答题字符串

          wx.setStorageSync("todayDaka" + zcode, myDate);

          wx.setStorage({
            key: 'user',
            data: user,
          })

          this.daka = this.selectComponent("#daka");
          this.daka.setData({
            jifen: SendJifen
          })
          this.daka.showDialog();
        }


        self.setData({
          SignDays: SignDays,
          SignHeadImgs: SignHeadImgs,
          SignNums: SignNums,
          SignTotalDays: SignTotalDays,
          current: current,
          isDaka: false,
          ksDate: result.ksDate ? result.ksDate:0
        })
      })

    },
    //根据连续签到天数和积分初始化签到数组
    initQiandao() {
      let qiandaos = this.data.qiandaos;
      let icons = this.data.icons;
      for (let i = 0; i < qiandaos.length; i++) {
        qiandaos[i] = {};
        if ((i + 1) % 7 == 1) {
          qiandaos[i].jifen = 5;
          qiandaos[i].icons
        } else if ((i + 1) % 7 == 2) {
          qiandaos[i].jifen = 10;
        } else if ((i + 1) % 7 == 3) {
          qiandaos[i].jifen = 20;
        } else if ((i + 1) % 7 == 4) {
          qiandaos[i].jifen = 30;
        } else if ((i + 1) % 7 == 5) {
          qiandaos[i].jifen = 50;
        } else if ((i + 1) % 7 == 6) {
          qiandaos[i].jifen = 100;
        } else if ((i + 1) % 7 == 0) {
          qiandaos[i].jifen = 200;
        }
      }

      this.setData({
        qiandaos: qiandaos
      })
    },

    //设置签到信息
    setQiandao(SignDays){
      let qiandaos = this.data.qiandaos;
      let icons = this.data.icons;
      for (let i = 0; i < qiandaos.length; i++) {
        let num = i < SignDays?0:1;
        qiandaos[i] = {};
        qiandaos[i].icon = icons[num];
        if ((i + 1) % 7 == 1) {
          qiandaos[i].jifen = 5;  
        } else if ((i + 1) % 7 == 2) {
          qiandaos[i].jifen = 10;
        } else if ((i + 1) % 7 == 3) {
          qiandaos[i].jifen = 20;
        } else if ((i + 1) % 7 == 4) {
          qiandaos[i].jifen = 30;
        } else if ((i + 1) % 7 == 5) {
          qiandaos[i].jifen = 50;
        } else if ((i + 1) % 7 == 6) {
          qiandaos[i].jifen = 100;
        } else if ((i + 1) % 7 == 0) {
          qiandaos[i].jifen = 200;
        }

        if(i == 6){
          qiandaos[i].icon = icons[num+2];
          qiandaos[i].jifen = 300;
        }else if(i == 14){
          qiandaos[i].icon = icons[num + 2];
          qiandaos[i].jifen = 205;
        }else if(i == 29){
          qiandaos[i].icon = icons[num + 2];
          qiandaos[i].jifen = 510;
        }
      }

      this.setData({
        qiandaos: qiandaos
      })

    },

    //toogle展示
    toogleDialog() {
      this.setData({
        isShow: !this.data.isShow
      })
    },
    //阻止事件冒泡
    stopBubbling: function(e) {},

    //点击了空地,让蒙版消失
    tapBlank: function(e) {
     
      this.setData({
        isShow: false
      })
    },

    //点击海报按钮
    _createHaibao: function(e) {
      let self = this;
      if (!this.data.SignDays){
        wx.showToast({
          title: '您太着急了,再试下',
          duration:3000,
          icon:'none'
        })
      }else{
        wx.showLoading({
          title: '生成中',
          mask: true
        })
        self.triggerEvent("createHaibao", { SignDays: this.data.SignDays, SignTotalDays: this.data.SignTotalDays });
      }
    }
  }

})
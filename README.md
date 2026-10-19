# Yue Shi's Homepage

原生 HTML、CSS、JavaScript 个人主页，Express 提供静态资源和首页分区路由，无需构建。

## 运行

```sh
npm ci
npm start
```

默认地址为 http://localhost:3000；可设置 `PORT` 修改端口。

## 结构

```text
public/
  index.html            首页容器、导航、分区和常驻音乐播放器
  about/index.html      独立的钢琴互动页面，由首页 iframe 加载
  projects/*.html       五个项目详情页，可独立访问或嵌入首页
  assets/
    audio/              背景音乐（唯一副本）
    life/               生活照片
    …                   项目图片和 PDF
  js/
    main.js             首页分区路由和初次加载
    project-router.js   内嵌项目加载、历史记录和返回导航
    transitions.js      首页与项目退出时的内容过渡
    project-page.js     项目目录、滚动高亮和键盘/鼠标焦点
    project-loading.js  独立项目页的初始加载
    project-exit-loading.js  独立项目页的离开过渡
    about.js            钢琴、研究笔记和重播
    music-player.js     常驻音乐播放器、拖动和会话状态
    header.js           响应式页眉高度测量
    background.js       星空背景
    experience.js       经历数据和列表交互
    skills.js           技能弹窗
    contact-details.js  邮箱和电话号码展示
    footer.js           首页各分区的页脚
  css/
    styles.css          共享样式入口，导入顺序决定级联覆盖关系
    base.css            全站基础组件
    pages.css           页面样式和原有响应式规则
    contact.css         联系页面
    layout.css          全站页眉、滚动和宽度规则
    project-navigation.css  项目目录及页面间距规则
    home.css            首页容器、表单验证码宽度和页脚覆盖
    about.css           钢琴 iframe 内的布局和交互样式
    footer.css          独立项目页的共享页脚
    …                   header、music-player、transitions 和 project-* 组件
server.js               仅公开 public/，处理首页分区路由
```

`/skills` 仍可直接访问。不要将没有主导航入口的页面视为废弃代码。
调整共享样式时保留 `styles.css` 中的导入顺序，并检查页面自身最后加载的样式。

## 验证

```sh
npm run check
```

检查 JavaScript 语法、HTML/CSS 本地资源引用、页面内锚点及重复 ID。
浏览器还需检查钢琴解锁和重播、音乐跨页面播放、项目目录定位、前进后退及移动端布局。

## 联系表单

沿用当前版本的原生 Formspree POST 提交和 Turnstile 组件，本地没有自建后端或 AJAX 表单控制器。
本轮清理没有新增表单提交行为；验证码服务端配置不在仓库中，未验证真实发送。

## 部署

运行 Express 时使用 `npm start`。静态托管时将 `public/` 设为发布目录，
仅将 `/projects`、`/professional`、`/life`、`/contact`、`/skills` 重写至
`/index.html`；`/projects/*.html` 和 `/about/index.html` 直接提供。

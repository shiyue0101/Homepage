# Yue Shi’s Homepage

原生 HTML、CSS、JavaScript 个人主页。Express 只提供 `public/` 和页面路由，无需构建。

## 运行和检查

```sh
npm ci
npm start
npm run check
```

默认访问 http://localhost:3000，可用 `PORT` 更改端口。
`check` 检查 JavaScript 语法、本地资源、页面锚点、重复 ID，以及路由别名和无效项目路径。

## 文件职责

```text
public/
  index.html                 主站容器、About、Projects、Experience、Skills、Life、Contact
  piano-home.html            全屏钢琴首页的标记，由主站 iframe 加载
  projects/*.html            五个项目详情页，支持独立访问和内嵌阅读
  assets/                    项目图片、生活照片、肖像、音乐及 PDF
  js/
    routes.js                路由、About 别名、页面标题和首页状态的统一定义
    main.js                  主站分区显示、初次加载和浏览器历史恢复
    project-router.js        内嵌项目加载、缓存、切换与退出
    transitions.js           主站切换时的内容过渡
    piano-home.js            88 键钢琴、导航/自由演奏、静音、音符动画
    piano-home-bridge.js     校验钢琴 iframe 发来的导航消息
    project-layout.js        项目正文和图片的独立滚动双栏
    project-page.js          项目目录、滚动高亮及焦点
    project-loading.js       独立项目页的初次加载
    project-exit-loading.js  独立项目页退出动画
    experience.js            从 HTML 模板渲染经历详情
    header.js                响应式页眉高度测量
    music-player.js          音乐播放、拖动及会话状态
    background.js            星空背景
    contact-details.js       展示联系方式
    skills.js                技能弹窗
    footer.js                主站分区页脚
  css/
    styles.css               共享样式入口，保留导入顺序
    base.css                 基础组件
    pages.css                页面与响应式规则
    layout.css               共享页眉、滚动和页面宽度
    home.css                 主站布局及加载覆盖
    piano-home.css           钢琴 iframe 内部样式
    piano-home-integration.css  全屏钢琴容器与主站页眉切换
    about.css                肖像、介绍和唯一的 About 页脚
    experience.css           经历详情滚动和正文间距
    contact.css              联系页面
    project-layout.css       项目双栏
    project-navigation.css   项目目录与间距
    …                        与脚本同名的组件样式，以及 footer.css
scripts/check.js             无额外依赖的静态和路由检查
server.js                    复用 routes.js 提供页面与静态文件
```

## 维护约定

- 页面路由与标题在 `public/js/routes.js` 修改；路由渲染主动同步状态，无需改写 `history` 方法或监听标题变动。
- `/about`、`/about/`、`/about/index.html` 都返回同一个 About 分区，不重定向。
- 经历内容只维护 `index.html` 内的 `experience-*` 模板；不要再复制到 JavaScript。
- 项目媒体放在 `<figure>` 中，由 `project-layout.js` 移入图片列；纯文字项目沿用单栏。
- 目录监听捕获阶段的滚动事件，以支持正文列独立滚动。
- `/skills` 仍可直接访问。没有导航入口不代表文件或功能废弃。
- 样式仍有按顺序生效的响应式覆盖；调整某一规则时检查页面末尾加载的样式。
- 根目录 `IMG_4713.JPG` 是原始照片，保留为编辑素材；网站加载 `public/assets/about/yue-portrait.jpg`。

## 联系表单

沿用原生 Formspree POST 提交和 Turnstile 组件，仓库内没有自建表单后端。
整理代码不发送真实消息，第三方验证码和邮件发送需单独验证。

## 部署

Express 部署运行 `npm start`。静态托管以 `public/` 为发布目录，
将主站分区路径及 About 别名重写到 `/index.html`；`/projects/*.html` 和
`/piano-home.html` 直接提供。不要把所有不存在的资源都重写为首页。

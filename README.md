# Yue Shi's Homepage

个人主页，使用原生 HTML、CSS、JavaScript 和 Express，无需构建步骤。

## 本地运行

```sh
npm ci
npm start
```

默认访问 http://localhost:3000，可通过 `PORT` 环境变量修改端口。

## 目录

```text
public/
  index.html                 首页及 Projects、Skills、Experience、Life、Contact 分区
  projects/                  五个项目详情页
  assets/                    图片、PDF，cat/ 为猫咪动画帧，life/ 为烘焙照片
  css/
    styles.css               样式入口，按固定顺序导入以下文件
    base.css                 基础样式和原有通用组件
    pages.css                导航、页面及响应式样式
    contact.css              联系表单和提示样式
    layout.css               页眉、滚动容器和页面间距覆盖
    project-navigation.css   项目浮动目录及其响应式状态
    cat-entrance.css          开场动画
    companion-cat.css         陪伴猫咪
  js/
    background.js            首页和详情页共享星空背景
    intro.js                 介绍文字及开场动画同步
    main.js                  首页分区路由、加载和切换
    experience.js            工作经历数据和列表交互
    skills.js                技能弹窗
    contact-details.js       联系信息展示
    contact-form.js          唯一的表单验证、验证码及发送逻辑
    project-page.js          项目目录、滚动高亮和焦点处理
    cat-entrance.js           猫咪与毛线球开场动画
    companion-cat.js          陪伴猫咪动画和布局
    companion-first-visit-guard.js  首次入场和返回首页时的坐姿控制
server.js                    仅公开 public/，处理首页分区路由
```

CSS 导入顺序保留了原有级联关系。调整布局时检查后续文件中的覆盖规则。
`/skills` 仍可直接访问，虽然没有放在主导航中。

## 联系表单

Formspree 地址位于 `public/js/contact-form.js`，Turnstile 站点密钥位于
`public/index.html`。表单先验证必填字段、邮箱和验证码，再通过 AJAX 发送。
服务端验证码验证与 Formspree 配置有关，本仓库没有自建验证接口。
本地验证不要发送真实消息；可模拟 fetch 测试成功及失败状态。

## 部署

使用 Express 时运行 `npm start`。使用静态托管时以 `public/` 为发布目录，
将 `/projects`、`/skills`、`/contact`、`/professional`、`/life` 重写至
`/index.html`；`/projects/*.html` 直接作为文件提供。

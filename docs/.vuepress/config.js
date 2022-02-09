module.exports = {
  title: "学习记录",
  description: "This is a blog.",
  themeConfig: {
    logo: "/assets/logo.jpg",
    sidebar: [
      {
        title: "React",
        collapsable: false,
        sidebarDepth: 1,
        children: [
          "/React/JSX",
          "/React/组件",
          "/React/表单",
          "/React/路由",
          "/React/生命周期",
          "/React/Redux",
          "/React/Hooks",
        ],
      },
      {
        title: "Nodejs",
        collapsable: false,
        sidebarDepth: 1,
        children: [
          "/Nodejs/基础",
          "/Nodejs/核心模块",
          "/Nodejs/通信",
          "/Nodejs/MongoDB",
        ],
      },
    ],
  },
  markdown: {
    lineNumbers: true,
  },
  evergreen: true,
};

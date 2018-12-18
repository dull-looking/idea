const path = require('path');

module.exports = {
  title: '推啊前端白皮书',
  description: 'tuia-frontend-manual',
  base: '/tuia-frontend-manual/',
  dest: './docs',
  configureWebpack: {
    resolve: {
      alias: {
        '@public': path.join(__dirname, './public')
      }
    }
  },
  themeConfig: {
    // 导航栏
    sidebarDepth: 2,
    displayAllHeaders: false,
    nav: [
      { text: '首页', link: '/' },
      { text: '关于我们', link: '/about' },
      { text: '联系我们', link: '/contact' }
    ],
    // 侧边栏
    sidebar: [
      {
        title: '开发规范',
        collapsable: false,
        children: [
          '/blog/develop/mobile/',
          '/blog/develop/performance/',
          '/blog/develop/animate/',
          '/blog/develop/enginnering/',
          '/blog/develop/game/'
        ]
      },
      {
        title: '安全防护',
        collapsable: false,
        children: [
          '/blog/safety/antiPlagiarism/',
          '/blog/safety/domain/',
          '/blog/safety/antiHijacking/',
          '/blog/safety/skyeye/'
        ]
      },
      {
        title: '数据埋点及可视化',
        collapsable: false,
        children: [
          '/blog/visualization/eyeSysterm/',
          '/blog/develop/exposure/'
        ]
      },
      {
        title: '工具平台',
        collapsable: false,
        children: [
          '/blog/platform/jimuBasics/',
          '/blog/platform/animateLib/',
          '/blog/platform/uiautotest/',
          '/blog/platform/heaven/',
          '/blog/platform/jimuPro/'
        ]
      }
    ]
  }
};

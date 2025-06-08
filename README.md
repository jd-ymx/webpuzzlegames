# GameHub - 网页游戏聚合平台

一个现代化的网页游戏聚合平台，让用户可以轻松发现和游玩各种优质的网页游戏。

## 功能特点

- 🎮 **游戏聚合**: 收集各种优质网页游戏，一站式游戏体验
- 🔍 **智能搜索**: 支持按游戏名称、描述、标签搜索
- 📱 **响应式设计**: 完美适配桌面端、平板和手机
- 🎯 **分类浏览**: 按游戏类型（益智、动作、策略、休闲）分类
- ⭐ **精选推荐**: 突出展示优质游戏
- 🚀 **快速加载**: 基于Next.js的高性能架构

## 技术栈

- **框架**: Next.js 15 + React 18
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **图标**: Lucide React
- **部署**: 支持Vercel等平台

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看网站。

### 构建生产版本

```bash
npm run build
npm start
```

## 添加新游戏

作为编程新手，添加新游戏非常简单！只需要编辑 `src/data/games.json` 文件：

### 1. 添加新的游戏分类（可选）

在 `categories` 数组中添加新分类：

```json
{
  "id": "sports",
  "name": "体育游戏",
  "nameEn": "Sports Games",
  "icon": "⚽"
}
```

### 2. 添加新游戏

在 `games` 数组中添加新游戏：

```json
{
  "id": "unique-game-id",
  "title": "游戏名称",
  "description": "游戏描述",
  "descriptionEn": "Game description in English",
  "category": "puzzle",
  "url": "https://game-website.com",
  "thumbnail": "https://game-website.com/icon.png",
  "featured": false,
  "tags": ["标签1", "标签2", "标签3"]
}
```

### 字段说明

- `id`: 游戏的唯一标识符
- `title`: 游戏名称
- `description`: 中文描述
- `descriptionEn`: 英文描述
- `category`: 游戏分类ID（必须是categories中已定义的）
- `url`: 游戏链接
- `thumbnail`: 游戏图标URL
- `featured`: 是否为精选游戏（true/false）
- `tags`: 游戏标签数组

## 项目结构

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # 全局样式
│   ├── layout.tsx      # 根布局
│   └── page.tsx        # 主页面
├── components/         # React组件
│   ├── Header.tsx      # 头部导航
│   ├── GameCard.tsx    # 游戏卡片
│   └── FeaturedSection.tsx # 精选区域
└── data/
    └── games.json      # 游戏数据配置
```

## 部署

### Vercel部署（推荐）

1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 自动部署完成

### 其他平台

项目支持部署到任何支持Next.js的平台，如Netlify、Railway等。

## 自定义样式

项目使用Tailwind CSS，可以轻松自定义：

- 修改 `tailwind.config.js` 中的主题配置
- 在 `src/app/globals.css` 中添加自定义CSS
- 组件中使用Tailwind工具类

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！ 
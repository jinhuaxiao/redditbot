# Reddit Assistant Extension

Reddit Assistant is a powerful browser extension designed to enhance your Reddit browsing experience. Built with the [Plasmo framework](https://docs.plasmo.com/), it provides intelligent interaction assistance for Reddit users.

## ✨ Key Features

- Smart Comment Assistant: Help users quickly generate appropriate comment replies
- Content Analysis: Automatically analyze post content and provide key information summaries
- User-Friendly Interface: Clean and intuitive operation panel
- Real-time Response: Fast and smooth user experience

## 🚀 Getting Started

### Development Setup

1. Clone the project and install dependencies:

```bash
git clone [your-repository-url]
cd reddit-assistant
pnpm install  # or npm install
```

2. Start the development server:

```bash
pnpm dev  # or npm run dev
```

3. Load the extension in your browser:
   - Open Chrome/Edge browser
   - Navigate to extensions page (chrome://extensions)
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `build/chrome-mv3-dev` directory in your project

## 🛠️ Production Build

Run the following command to generate a production build:

```bash
pnpm build  # or npm run build
```

The production build will be available in the `build` directory.

## 📦 Store Deployment

1. Generate production build
2. Zip the files in the `build` directory
3. Submit to browser extension stores:
   - [Chrome Web Store](https://chrome.google.com/webstore/devconsole)
   - [Edge Add-ons](https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview)

## 🤝 Contributing

We welcome Pull Requests and Issues! Please ensure:

1. Follow the project's code standards
2. Add appropriate test cases
3. Update relevant documentation

## 📄 License

This project is licensed under the [MIT License](LICENSE)

## 🔗 Links

- [Report Issues](your-issues-url)
- [Documentation](your-docs-url)
- [Plasmo Framework](https://docs.plasmo.com/)

---

# Reddit Assistant Extension (中文)

Reddit Assistant 是一个强大的浏览器扩展，旨在提升您的 Reddit 浏览体验。这个扩展基于 [Plasmo 框架](https://docs.plasmo.com/) 开发，为 Reddit 用户提供智能化的交互辅助功能。

## 🌟 主要功能

- 智能评论助手：帮助用户快速生成合适的评论回复
- 内容分析：自动分析帖子内容，提供关键信息摘要
- 用户友好界面：简洁直观的操作面板
- 实时响应：快速且流畅的用户体验

## 🚀 快速开始

### 开发环境设置

1. 克隆项目并安装依赖：

```bash
git clone [your-repository-url]
cd reddit-assistant
pnpm install  # 或 npm install
```

2. 启动开发服务器：

```bash
pnpm dev  # 或 npm run dev
```

3. 在浏览器中加载扩展：
   - 打开 Chrome/Edge 浏览器
   - 访问扩展管理页面 (chrome://extensions)
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目中的 `build/chrome-mv3-dev` 目录

## 🛠️ 构建生产版本

执行以下命令生成生产版本：

```bash
pnpm build  # 或 npm run build
```

构建完成后，生产版本将位于 `build` 目录中。

## 📦 发布到应用商店

1. 生成生产构建包
2. 压缩 `build` 目录中的相关文件
3. 提交到相应的浏览器扩展商店：
   - [Chrome Web Store](https://chrome.google.com/webstore/devconsole)
   - [Edge Add-ons](https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview)

## 🤝 贡献指南

欢迎提交 Pull Requests 和 Issues！请确保：

1. 遵循项目的代码规范
2. 添加适当的测试用例
3. 更新相关文档

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)

## 🔗 相关链接

- [问题反馈](your-issues-url)
- [项目文档](your-docs-url)
- [Plasmo 框架文档](https://docs.plasmo.com/)

---

Built with [Plasmo](https://docs.plasmo.com/) Framework

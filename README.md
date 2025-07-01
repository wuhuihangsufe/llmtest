# 大语言模型测评网站 (FINEVAL)

这是一个用于收集和展示大语言模型（LLM）测评结果的Web应用。用户可以在此网站上，对多个匿名大模型针对一系列固定问题的回答进行打分和评价。

## ✨ 项目特色

- **清晰的测评流程**: 用户首先填写基本信息，然后进入一个统一的测评主页，逐一完成所有问题的评价，最后一次性提交所有数据。
- **避免顺序偏见**: 在测评主页，不同模型的回答顺序在每次加载时都会被随机打乱。
- **所见即所得的内容管理**: 所有的问题和答案均以本地Markdown文件的形式进行管理，便于非技术人员直接修改和扩展。
- **现代化的技术栈**: 使用 Next.js, Tailwind CSS 和 Supabase 构建，开发体验优秀，易于部署和维护。
- **样式隔离**: 通过`<iframe>`沙盒环境来渲染Markdown内容，确保了自定义样式和主页面样式互不干扰，完美显示表格、代码块、列表和图片。

## 🛠️ 技术栈

- **前端框架**: [Next.js](https://nextjs.org/) (使用App Router)
- **样式方案**: [Tailwind CSS](https://tailwindcss.com/)
- **后端即服务 (BaaS)**: [Supabase](https://supabase.com/) (用于数据库和API)
- **部署平台**: [Vercel](https://vercel.com/)
- **Markdown渲染**: [Remark](https://remark.js.org/) + [remark-gfm](https://github.com/remarkjs/remark-gfm)

## 📁 项目结构

```
FINEVAL/
├── _answers/                 # 存放所有问题和答案的Markdown文件
│   ├── question-1/
│   │   ├── images/           # 问题1专用的图片文件夹
│   │   │   └── Q1MH.png
│   │   ├── model-a.md
│   │   ├── ...
│   │   └── question.txt      # 问题1的描述文本
│   └── ...
├── app/                      # Next.js App Router 核心目录
│   ├── components/           # React组件
│   ├── evaluate/             # 测评主页
│   └── ...
├── lib/                      # 辅助函数和类型定义
├── public/                   # 存放公开静态资源
│   └── css/
│       └── markdown.css      # Markdown内容的专属样式表
└── ...
```

## 🚀 本地开发指南

1.  **克隆项目**
    ```bash
    git clone https://github.com/wuhuihangsufe/llmtest.git
    cd llmtest
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **配置环境变量**
    - 复制 `.env.example` 文件并重命名为 `.env.local`。
    - 在 `.env.local` 文件中填入您的 Supabase 项目信息和本地开发URL。
    ```env
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

    # 本地开发服务器地址
    BASE_URL=http://localhost:3000
    ```

4.  **设置Supabase数据库**
    - 前往您的 Supabase 项目，创建一个名为 `submissions` 的表。
    - 为 `submissions` 表开启行级安全策略 (RLS)，并添加一个新策略，允许 `anon` 和 `authenticated` 角色进行 `INSERT` 操作。

5.  **启动本地服务器**
    ```bash
    npm run dev
    ```
    现在，您可以在浏览器中打开 `http://localhost:3000` 来访问本地开发环境。

## 部署上线

本项目已配置为可以无缝部署到 [Vercel](https://vercel.com/)。

1.  **推送代码到GitHub**。

2.  **在Vercel上导入项目**。
    - 使用您的GitHub账号登录Vercel。
    - 选择导入您刚刚推送的仓库。

3.  **在Vercel中配置环境变量**。
    - 在项目设置的 "Environment Variables" 中，添加您在 `.env.local` 中配置的三个变量。
    - **重要**: 将 `BASE_URL` 的值修改为您最终的Vercel线上域名 (例如: `https://your-project-name.vercel.app`)。

4.  **点击 "Deploy"**，Vercel将自动完成所有构建和部署工作。

# macOS 上跑 Remotion：安装检查与启动步骤

是的，Node.js 装好了。这段话是 macOS 安装包结束时的标准提示，说明 Node.js v24.21.0 和 npm v11.19.0 已经装到了 `/usr/local/bin`。

## 先确认一下

关掉现有的终端窗口，重新开一个（让 PATH 生效），然后运行：

```bash
node -v
npm -v
```

分别打印出 `v24.21.0` 和 `11.19.0` 就没问题。如果提示 `command not found`，运行下面这句再试：

```bash
export PATH="/usr/local/bin:$PATH"
```

## 然后就可以跑 Remotion 了

如果本机还没有这个仓库，先克隆（第一次运行 `git` 时 macOS 可能会弹窗让你装命令行工具，点安装即可）：

```bash
git clone https://github.com/z2099714553-crypto/jz-.git
cd jz-
```

已经有仓库的话直接进目录。接着：

```bash
git fetch origin claude/awesome-curie-jcakb0
git checkout claude/awesome-curie-jcakb0
cd video
npm install
npm run dev
```

`npm run dev` 会打印一个 `http://localhost:3000` 的地址，浏览器打开就是 Remotion Studio，左侧能看到 HelloWorld 和 OnlyLogo 两个示例。卡在哪一步把报错贴给我就行。

# 趣味三字经 - 儿童启蒙学习应用

这是一个专为儿童设计的三字经学习网页应用，特别适配移动端，使用Python + Flask作为后端，HTML + CSS + JavaScript作为前端。

## 功能特点

- 适合3岁以上儿童使用的趣味界面
- 逐句学习三字经内容
- 每个汉字都能点击播放发音
- 语音朗读功能，帮助孩子记忆
- 简化的解释，适合儿童理解
- 响应式设计，适合在手机、平板等设备上使用

## 安装与运行

1. 克隆本仓库到本地

```bash
git clone <仓库地址>
cd sanzijing
```

2. 安装依赖

```bash
pip install -r requirements.txt
```

3. 运行应用

```bash
python app.py
```

4. 在浏览器中访问 `http://localhost:5000` 即可使用应用

## 使用说明

- 点击"上一句"和"下一句"按钮可以切换不同的三字经句子
- 点击"朗读"按钮可以听到当前句子的完整朗读
- 点击"重复"按钮可以再次听取朗读
- 点击每个汉字可以单独听取该字的发音
- 页面底部会显示当前句子的简单解释

## 技术栈

- 后端：Python + Flask
- 前端：HTML5 + CSS3 + JavaScript
- 语音合成：Web Speech API

## 定制化

如果需要添加更多三字经内容或修改解释，可以编辑 `app.py` 文件中的 `SANZIJING` 列表和 `app.js` 文件中的 `explanations` 数组。

## 贡献

欢迎提交PR或Issues来帮助改进这个项目！

## 许可证

MIT

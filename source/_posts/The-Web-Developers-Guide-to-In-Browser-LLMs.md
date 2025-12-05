---
title: 浏览器运行LLM开发者指南【翻译】
date: 2025-12-05 16:11:15
index_img: https://blog-1302597662.cos.ap-shanghai.myqcloud.com/in-browser-llm-guide.jpg
tags: [LLM]
categories: [LLM]
---
# 介绍
想象一下，在AI电脑上构建完全运行在网页浏览器中的轻量级AI驱动应用。这些应用降低服务器成本，增强隐私，甚至离线运行。从实时文本摘要和聊天机器人，到图像增强工具、语音助手和AI笔记应用，浏览器内AI开发开启了令人兴奋的新可能。

虽然像ChatGPT这样的全尺寸模型仍然需要大量资源，但随着硬件、浏览器功能的进步以及JavaScript生态系统的发展，我们可以在浏览器中高效运行更小的AI模型。本文将探讨支持浏览器内大型语言模型推理的JavaScript框架，讨论其优势，并强调开发者利用AI电脑力量的关键事项。

# 浏览器内AI背后的隐藏复杂性
在深入探讨现有框架之前，了解使浏览器内大型语言模型成为可能的底层非常重要。开发者可能不需要直接与这些层互动，但具备高层理解有助于优化性能、排查问题以及决定使用哪种框架。

![i](https://blog-1302597662.cos.ap-shanghai.myqcloud.com/inbrowserllm1.png)

让我们从底部开始逐层讨论：

1. 硬件（GPU/CPU/NPU）：高效的AI计算依赖于专用硬件，如用于通用AI任务的GPU，而神经处理单元（NPU）则设计用于处理特定工作负载，如AI推理和移动设备如AI电脑中的AI驱动任务，这些任务在这些方面对能效和性能优化至关重要。

2. 操作系统原生API（Windows/macOS/Linux/iOS/Android）：操作系统管理硬件资源，并提供浏览器利用的原生API，以便与硬件交互。

3. 浏览器API（WebGL/WebGPU/WebNN/WebAssembly）：这些技术实现高效的硬件加速，无需平台特定代码，确保跨设备兼容性。
	+ WebGPU：一种现代Web API，提供对GPU的低层访问，用于高性能计算和图形渲染。它是WebGL的继任者，支持通用GPU（GPGPU）任务。通过将昂贵的计算负载转移到GPU来降低CPU开销。查看支持的浏览器：[WebGPU兼容性](https://developer.mozilla.org/en-US/docs/Web/API/GPU#browser_compatibility)。WebGPU 通常默认不启用，所以你可能需要通过浏览器特定的功能标志开启。以下是如何在流行浏览器上启用WebGPU：
		- Chromium：进入 chrome://flags，搜索“Unsafe WebGPU”并启用。
		- Firefox：进入about：config，搜索“dom.webgpu.enabled”和“gfx.webgpu.force-enabled”，然后将两者都设置为true。
		
		启用这些标志后，您可能需要重启浏览器以使更改生效。
	+ WebNN：一个JavaScript API，旨在直接在网页浏览器中实现高效的神经网络推理。它为运行使用CPU、GPU或NPU等底层硬件能力的机器学习模型提供了统一的抽象。它使网页应用中的AI推理实现了近乎原生的性能。在配备Intel® Core™ Ultra处理器的Windows设备上启用WebNN的详细步骤可在此找到。
	+ WebAssembly：一种二进制指令格式，使浏览器内用 C、C++ 或 Rust 编写的代码实现近乎原生的性能。

大多数 JavaScript 框架都建立在一种或多种这些浏览器技术之上，提供易用的界面，抽象化了底层优化。这使开发者能够专注于构建人工智能驱动的应用，而非处理设备或作系统的兼容性问题。点击这个链接来追踪这些技术的浏览器支持。
# 用于浏览器内大型语言模型的JavaScript框架
掌握了操作系统原生API的知识后，让我们探索可用于在浏览器中运行LLM的JavaScript框架。这些框架通过抽象浏览器 API 并提供用户友好的 API 简化了应用开发。
## [WEBLLM](https://webllm.mlc.ai/)
一个高性能开源框架，专为浏览器内的大型语言模型推理设计：

+ WebGPU 与 WebAssembly 加速：结合了 WebGPU 实现高效的本地 GPU 加速与 WebAssembly（Wasm）实现高性能 CPU 计算，实现浏览器中的无缝 AI 模型执行。
+ OpenAI风格的API：易于整合到现有应用中。
+ 模型支持：支持Llama 3、Phi 3、Gemma、Mistral、Qwen、DeepSeek等。
+ 结构化生成：支持JSON模式进行结构化输出。
+ Web Worker 集成：将计算工作卸载到独立线程，实现界面交互的流畅。

这里有一个代码片段，展示了使用 WebLLM 的简单性：

```javascript
import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";

 // Initialize with a progress callback
 const initProgressCallback = (progress) => {
     console.log("Model loading progress:", progress);
 };

// Initializing Engine
const engine = await CreateMLCEngine("Llama-3.1-8B-Instruct", { initProgressCallback });
const messages = [
    { role: "system", content: "You are a helpful AI assistant." },
    { role: "user", content: "Hello!" }
];

// Calling the Engine
const reply = await engine.chat.completions.create({
    messages,
});
console.log(reply.choices[0].message);
console.log(reply.usage);
```
上述代码片段展示了WebLLM对OpenAI风格API的高度模仿。这使得切换到 WebLLM 作为 OpenAI API 调用的替代变得非常容易。

想体验完整体验并了解WebLLM的全部功能，可以试试[WebLLM Chat](https://chat.webllm.ai/)，开始构建时可以查看相关文档。

## [Transformers.js](https://huggingface.co/docs/transformers.js/v3.0.0/index)
这是另一个强大的框架，专为浏览器中运行基于变换器的模型而优化。它建立在 ONNX Runtime Web之上。它提供：
+ WebGPU 加速：优化用于高效运行 Web GPU 的 AI 模型。它还能利用WebNN和WASM等其他后端技术。
+ ONNX 模型支持：允许执行 ONNX 格式模型，这是机器学习中广泛使用的标准。
+ 专为变换器模型设计：专为现代大型语言模型（LLM）架构设计。

这里有一个演示文本生成的简短代码片段：

```javascript
import { pipeline } from '@huggingface/transformers';
const generator = await pipeline('text-generation', 'Xenova/distilgpt2');
const text = 'Hello';
const output = await generator(text);
```
如图所示，这与Hugging Face Transformers的Python API非常相似——这是有意为之。它很棒，因为它让你能够处理NLP、视觉、音频和多模态领域的各种任务。你可以在这里查看完整的可用任务列表。要开始，可以看看Transformers.js文档。

注意：你需要开发一些自定义工具，以完整复制OpenAI JS客户端的体验。

## [ONNX Runtime Web](https://onnxruntime.ai/docs/get-started/with-javascript/web.html)
ONNX Runtime Web是一个多功能框架，支持多个后端，包括 WebGPU、WebGL、WebNN 和 WebAssembly，适合在浏览器中运行预训练的 ONNX 模型。
# 其他一些框架

## [TensorFlow.js](https://www.tensorflow.org/js)
TensorFlow.js 是一个成熟的机器学习库，支持浏览器内的模型训练和推理。虽然它支持一些基于BERT的模型，但对大型语言模型来说并不理想，因为它更侧重于机器学习。

## [MediaPipe LLM Inference](https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference/web_js)
MediaPipe LLM Inference 是该领域的新兴产品。它还处于实验阶段，仍在积极开发中，但值得关注。

# 选择合适的框架和浏览器设置
既然我们已经了解了浏览器功能和各种JavaScript框架，以下是在为你下一个项目选择合适工具时需要注意的关键点：

浏览器及设备特定考虑因素：
+ 目标基于 Chromium 的浏览器：这些浏览器对 WebGPU 和 WebNN 提供了最佳支持，这两者对 AI 工作负载至关重要。
+ 英特尔® AI PC（Core Ultra + Windows）：这些PC搭载英特尔® Core™ Ultra处理器，包括CPU、GPU和神经处理单元（NPU），以更高效地处理AI工作负载。如果你使用的是英特尔最新的 AI PC 笔记本，务必在浏览器中启用 WebNN 和 WebGPU 功能。像 ONNX 运行时 Web 或 Transformers.js 这样的框架可以利用 WebNN API 充分利用 NPU，实现最佳性能。

JavaScript 框架：

+ WebLLM 和 Transformers.js：由于其易用性和针对大型语言模型 (LLM) 的优化，它们是大多数开发人员的最佳起点。
	- WebLLM：专为LLM推理设计，使用WebGPU加速，但目前无法使用非点单元（NPU）。
	- Transformers.js：最适合自然语言处理和视觉模型。
+ ONNX 运行时网页：该框架支持多种机器学习模型，提供更多灵活性和自定义性。不过，它可能冗长，需要你实现或定义许多组件。如果你需要灵活性，值得探索，但要做好复杂性准备。

以下是 WebLLM、Transformers.js 和 ONNX 运行时 Web 主要特性的对比表：

|特征|WebLLM|Transformers.js|ONNX Runtime Web|
|-|-|-|-|
|主要关注点|浏览器中的大型语言模型（LLM）推理|自然语言处理（NLP）和浏览器中的视觉模型|浏览器中的各种机器学习模型|
|易用性|高;设计用于与 OpenAI 风格的 API 无缝集成|高;功能等同于Hugging Face的Python库|温和;需要更多的模型组件设置和理解|
|硬件加速|利用WebGPU进行GPU加速;不支持NPU|利用WebGPU进行GPU加速;其他后端如WebNN、Wasm和ONNX。支持NPU|支持 WebGPU/WebGL 加速、WebNN 和 WebAssembly。支持NPU。|

# 重大胜利：为什么浏览器内AI如此重要
向浏览器内人工智能的转变不仅仅是技术可行性的问题——它代表了人工智能应用开发和部署方式的根本转变。一些主要好处包括：

+ 隐私：用户数据会保留在设备上，最大限度地降低安全风险。
+ 成本节约：消除昂贵云服务器的需求。
+ 快速响应：AI模型能够即时响应，无需依赖服务器往返。
+ 跨平台兼容性：一个代码库可以无缝兼容Windows、macOS、iOS和Android。

现代浏览器正在迅速发展，以原生支持AI工作负载。借助WebGPU和WebNN等技术，开发者现在可以直接访问硬件加速，使浏览器内LLM成为服务器端AI解决方案的可行且强大的替代方案。

# 结论

在浏览器中运行大型语言模型已不再只是未来的想法——这得益于硬件和浏览器技术的进步，已成为现实。无论你是在构建聊天机器人、AI助手，还是实时文本摘要工具，利用WebLLM、Transformers.js和ONNX Runtime Web等框架，都能使开发变得无缝高效。随着AI电脑的普及，基于浏览器的AI只会变得更强大，为开发者和用户开启新的可能性。

通过了解可用的框架及其与浏览器API的交互，你可以打造高性能的AI应用，充分利用客户端处理。

原文：[The Web Developer’s Guide to In-Browser LLMs
](https://www.intel.com/content/www/us/en/developer/articles/technical/web-developers-guide-to-in-browser-llms.html)






















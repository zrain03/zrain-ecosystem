# U²-Netp model and external runtime notice

The Zrain Background Remover uses the U²-Netp ONNX model from `edgetools/u2netp` on Hugging Face (mirror of the rembg release), Apache License 2.0.
Model source: https://huggingface.co/edgetools/u2netp
Pinned model revision: `25dee37ab19c5b6ad64ba6578eba63f1ae07720c`
Published SHA-256: `309c8469258dda742793dce0ebea8e6dd393174f89934733ecc8b14c76f4ddd8`

Paper: *U2-Net: Going Deeper with Nested U-Structure for Salient Object Detection*, Pattern Recognition (2020).

Model weights are **not distributed in this package**. The user browser fetches the public model file on first use. Browser inference runs locally with ONNX Runtime Web. For privacy, no uploaded image is intentionally sent to the model host. CDN and model-file availability and browser support must be checked on actual devices.

ONNX Runtime Web source: https://github.com/microsoft/onnxruntime (MIT)
https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/

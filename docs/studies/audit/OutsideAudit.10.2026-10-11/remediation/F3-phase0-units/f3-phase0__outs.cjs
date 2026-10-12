const path=require("path");const [repo,root]=process.argv.slice(2);
const ort=require(path.join(repo,"node_modules/onnxruntime-node"));
(async()=>{const s=await ort.InferenceSession.create(path.join(root,"onnx-community/Kokoro-82M-v1.0-ONNX/onnx/model_q4.onnx"));
console.log("inputs:",s.inputNames.join(","),"| outputs:",s.outputNames.join(","));
console.log("node arch:",process.arch,"| os arch env:",process.env.PROCESSOR_ARCHITECTURE,process.env.PROCESSOR_ARCHITEW6432||"");})().catch(e=>console.log("ERR",e.message));

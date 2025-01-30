"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aws_sdk_1 = require("aws-sdk");
const constants_1 = require("./constants");
// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);
    res
        .status(500)
        .json({ error: "Internal Server Error", message: err.message });
};
let s3;
try {
    const secretAccessKey = process.env.CLOUD_FLARE_SECRET;
    if (!secretAccessKey) {
        throw new Error("CLOUD_FLARE_SECRET environment variable is not set");
    }
    s3 = new aws_sdk_1.S3({
        endpoint: constants_1.CLOUD_FLARE_BUCKET_URL,
        accessKeyId: constants_1.CLOUD_FLARE_ACC_ID,
        secretAccessKey: secretAccessKey,
    });
}
catch (error) {
    console.error("Failed to initialize S3:", error);
    process.exit(1);
}
const app = (0, express_1.default)();
// Main route with error handling
app.get("/*", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hostname = req.hostname;
        const id = hostname.split(".")[0];
        const filePath = req.path;
        const content = yield s3
            .getObject({
            Bucket: "clique-host",
            Key: `dist/${id}${filePath}`,
        })
            .promise();
        const type = filePath.endsWith("html")
            ? "text/html"
            : filePath.endsWith("css")
                ? "text/css"
                : "application/javascript";
        if (!content.Body) {
            throw new Error("No content found");
        }
        res.set("Content-Type", type);
        res.send(content.Body);
    }
    catch (error) {
        if (error.code === "NoSuchKey") {
            res.status(404).json({ error: "File not found" });
        }
        else {
            next(error);
        }
    }
}));
app.use(errorHandler);
const server = app
    .listen(3001, () => {
    console.log("Listening on 3001");
})
    .on("error", (error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
// Handle graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    server.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
});

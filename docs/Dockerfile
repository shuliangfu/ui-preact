# ============================================
# 基础阶段：仅 Deno 运行时，不安装 apt 包（避免镜像内空间不足）
# ============================================
FROM denoland/deno:latest AS base

# 设置工作目录；compose 挂载 .:/app，运行时使用宿主机项目（需先在宿主机执行 deno task build）
WORKDIR /app

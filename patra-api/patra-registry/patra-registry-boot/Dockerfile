# patra-registry 运行镜像
# CI 已用 Gradle 构建好 bootJar（复用 Actions Gradle 缓存），这里只把 jar 装进精简运行镜像。
FROM eclipse-temurin:25-jre

# compose healthcheck 需要 curl（temurin jre 镜像默认不含）
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 非 root 运行（纵深防御）。应用 logback 写 /app/logs/，故预建该目录并交给 appuser，
# 否则非 root 无权创建日志目录会导致启动失败（Exited 1）。
RUN useradd -r -u 10001 appuser \
    && mkdir -p /app/logs \
    && chown -R appuser:appuser /app

# bootJar 产物：archiveClassifier="" 且禁用 plain jar，build/libs 下只有一个 fat jar
COPY --chown=appuser:appuser build/libs/*.jar app.jar

USER appuser

EXPOSE 6000

# 容器感知内存（temurin 25 默认开启 container support；显式给上限更稳）
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]

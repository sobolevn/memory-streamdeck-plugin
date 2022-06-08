SHELL:=/usr/bin/env bash

.PHONY: deno-lint
deno-lint:
	deno fmt --check memory-deno
	deno lint memory-deno

.PHONY: deno-deps
deno-deps:
	@deno cache memory-deno/deps.ts

.PHONY: deno-dist
deno-dist: deno-deps
	@rm -rf ./com.sobolevn.memory.sdPlugin/dist/macos
	@deno compile \
		--check \
		--no-config \
		--cached-only \
		--unstable \
		--allow-env \
		--allow-net=localhost \
		--allow-write \
		--output=com.sobolevn.memory.sdPlugin/dist/main \
		memory-deno/main.ts

.PHONY: plugin
plugin:
	@rm -rf ./Release
	@mkdir ./Release
	@./DistributionTool -b -i ./com.sobolevn.memory.sdPlugin -o ./Release

.PHONY: build
build: deno-dist plugin

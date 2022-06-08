# Elgato StreamDeck Memory Monitoring Plugin

[![test](https://github.com/sobolevn/memory-streamdeck-plugin/actions/workflows/test.yml/badge.svg)](https://github.com/sobolevn/memory-streamdeck-plugin/actions/workflows/test.yml)

Allows you to toggle your memory state from the StreamDeck.


## Installation

To install, please:
1. Download `com.sobolevn.memory.streamDeckPlugin` from [releases](https://github.com/sobolevn/memory-streamdeck-plugin/releases)
2. Double click on this file, StreamDeck will promt you about further installation

It should probably work for both macOS and Windows.


## Development

### Installing Deno

We use the latest `1.x` Deno runtime.
To install it - see the official guide.

### Development

Run `make deno-dist` to type-check and compile your app.
Dependencies are always cached and are listed in `deps.ts`.

Run `make build` to build the StreamDeck plugin itself.


## Acknowledgements

Icons:

- https://www.flaticon.com/free-icon/ram-memory_908522

DistributionTool:

- https://developer.elgato.com/documentation/stream-deck/sdk/packaging/

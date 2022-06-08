import { log, logHandlers } from "./deps.ts";

// System stuff

function getUsedMemoryPercent(): string {
  const memoryUsage = Deno.systemMemoryInfo();
  const used = memoryUsage.total - memoryUsage.available;
  return Number((used / memoryUsage.total) * 100).toFixed(1);
}

// Stream deck

class StreamDeckExchange {
  args: PassedArgs;
  websocket: WebSocket;
  fileHandler: logHandlers.FileHandler;
  logger: log.Logger;
  existingInterval: number;
  context: string;

  constructor(
    args: PassedArgs,
    fileHandler: logHandlers.FileHandler,
    logger: log.Logger,
  ) {
    this.args = args;

    this.websocket = new WebSocket(`ws://localhost:${this.args.port}`);
    this.websocket.onopen = this.websocketOpen.bind(this);
    this.websocket.onmessage = this.websocketMessage.bind(this);
    this.websocket.onerror = this.websocketError.bind(this);

    this.fileHandler = fileHandler;
    this.logger = logger;

    // Do nothing while we wait for websocket to open:
    this.existingInterval = setInterval(() => null, 1000);
    this.context = "";
  }

  websocketOpen(): void {
    this.sendToStreamDeck({
      event: this.args.registerEvent,
      uuid: this.args.pluginUUID,
    });
  }

  websocketMessage(event: MessageEvent): void {
    const payload = JSON.parse(event.data);
    if (payload.context !== this.context) {
      clearInterval(this.existingInterval);

      this.context = payload.context;
      this.existingInterval = setInterval(
        () => this.reportMemoryUsage(),
        1000,
      );
    }
  }

  websocketError(event: Event): void {
    this.logger.error("ws error");
    this.logger.error(event);
    this.fileHandler.flush();
  }

  // deno-lint-ignore no-explicit-any
  sendToStreamDeck(payload: any): void {
    this.websocket.send(JSON.stringify(payload));
  }

  reportMemoryUsage(): void {
    const percentage = getUsedMemoryPercent();
    this.sendToStreamDeck({
      event: "setTitle",
      context: this.context,
      payload: {
        title: `${percentage}%`,
      },
    });
  }
}

// Args parsing

interface PassedArgs {
  port: string;
  pluginUUID: string;
  registerEvent: string;
}

function parseArgs(args: string[]): PassedArgs {
  const result: Record<string, string> = {};
  for (let index = 0; index < args.length; index += 2) {
    result[args[index].replace("-", "")] = args[index + 1];
  }
  return result as unknown as PassedArgs;
}

// Logging

function createFileHandler(): logHandlers.FileHandler {
  return new log.handlers.FileHandler("INFO", {
    filename: "./log.txt",
    formatter: "{levelName} {msg}",
  });
}

async function createLogger(
  handler: logHandlers.FileHandler,
): Promise<log.Logger> {
  await log.setup({
    handlers: {
      file: handler,
    },

    loggers: {
      default: {
        level: "INFO",
        handlers: ["file"],
      },
    },
  });
  return log.getLogger();
}

// Main entry point

async function main(): Promise<void> {
  const fileHandler = createFileHandler();
  const logger = await createLogger(fileHandler);

  logger.info("starting plugin");

  const args = parseArgs(Deno.args);
  logger.info("got args");
  logger.info(Deno.args);
  logger.info(args);

  fileHandler.flush();

  new StreamDeckExchange(args, fileHandler, logger);
}

await main();

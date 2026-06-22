#!/usr/bin/env bun

import { parseArgs } from 'node:util';

type Command = {
  summary: string;
  usage: string;
  run: (argv: string[]) => Promise<void> | void;
};

const VERSION = '0.1.0';

const aliases: Record<string, string[]> = {
  'migrate-up': ['migrate', 'up'],
  'migrate-down': ['migrate', 'down'],
  'migrate-create': ['migrate', 'create'],
  'db-seed': ['db', 'seed'],
  'db-reset': ['db', 'reset'],

  // futuros aliases
  'create-route': ['create', 'route'],
  'create-service': ['create', 'service'],
  'create-middleware': ['create', 'middleware'],
};

const commands: Record<string, Command> = {
  migrate: {
    summary: 'Manage database migrations.',
    usage: 'talon migrate <up|down|create>',
    run() {
      printGroupHelp('migrate');
    },
  },

  'migrate up': {
    summary: 'Run pending migrations.',
    usage: 'talon migrate up [--steps <number>] [--dry-run]',
    async run(argv) {
      const { values } = parseArgs({
        args: argv,
        options: {
          steps: {
            type: 'string',
          },
          'dry-run': {
            type: 'boolean',
          },
        },
        strict: true,
        allowPositionals: false,
      });

      const steps = parsePositiveInteger(values.steps, '--steps');

      await runCommand('migrate up', {
        steps,
        dryRun: Boolean(values['dry-run']),
      });
    },
  },

  'migrate down': {
    summary: 'Rollback migrations.',
    usage: 'talon migrate down [--steps <number>] [--dry-run]',
    async run(argv) {
      const { values } = parseArgs({
        args: argv,
        options: {
          steps: {
            type: 'string',
          },
          'dry-run': {
            type: 'boolean',
          },
        },
        strict: true,
        allowPositionals: false,
      });

      const steps = parsePositiveInteger(values.steps, '--steps') ?? 1;

      await runCommand('migrate down', {
        steps,
        dryRun: Boolean(values['dry-run']),
      });
    },
  },

  'migrate create': {
    summary: 'Create a new migration file.',
    usage: 'talon migrate create <name>',
    async run(argv) {
      const { positionals } = parseArgs({
        args: argv,
        options: {},
        strict: true,
        allowPositionals: true,
      });

      const name = positionals[0];

      if (!name) {
        fail('Missing migration name. Usage: talon migrate create <name>');
      }

      await runCommand('migrate create', {
        name,
      });
    },
  },

  db: {
    summary: 'Manage database utilities.',
    usage: 'talon db <seed|reset>',
    run() {
      printGroupHelp('db');
    },
  },

  'db seed': {
    summary: 'Run database seed scripts.',
    usage: 'talon db seed [--file <path>]',
    async run(argv) {
      const { values } = parseArgs({
        args: argv,
        options: {
          file: {
            type: 'string',
          },
        },
        strict: true,
        allowPositionals: false,
      });

      await runCommand('db seed', {
        file: values.file,
      });
    },
  },

  'db reset': {
    summary: 'Reset the database.',
    usage: 'talon db reset --force',
    async run(argv) {
      const { values } = parseArgs({
        args: argv,
        options: {
          force: {
            type: 'boolean',
          },
          yes: {
            type: 'boolean',
          },
        },
        strict: true,
        allowPositionals: false,
      });

      const confirmed = Boolean(values.force || values.yes);

      if (!confirmed) {
        fail('Database reset is destructive. Re-run with --force.');
      }

      await runCommand('db reset', {
        force: true,
      });
    },
  },

  create: {
    summary: 'Generate Talon project files.',
    usage: 'talon create <route|service|middleware> <name>',
    run() {
      printGroupHelp('create');
    },
  },

  'create route': {
    summary: 'Create a new route.',
    usage: 'talon create route <name>',
    async run(argv) {
      const name = readRequiredName(argv, 'talon create route <name>');

      await runCommand('create route', {
        name,
      });
    },
  },

  'create service': {
    summary: 'Create a new service.',
    usage: 'talon create service <name>',
    async run(argv) {
      const name = readRequiredName(argv, 'talon create service <name>');

      await runCommand('create service', {
        name,
      });
    },
  },

  'create middleware': {
    summary: 'Create a new middleware.',
    usage: 'talon create middleware <name>',
    async run(argv) {
      const name = readRequiredName(argv, 'talon create middleware <name>');

      await runCommand('create middleware', {
        name,
      });
    },
  },

  start: {
    summary: 'Start the Talon application.',
    usage: 'talon start [--port <number>]',
    async run(argv) {
      const { values } = parseArgs({
        args: argv,
        options: {
          port: {
            type: 'string',
          },
        },
        strict: true,
        allowPositionals: false,
      });

      const port = parsePositiveInteger(values.port, '--port');

      await runCommand('start', {
        port,
      });
    },
  },
};

async function main() {
  const argv = Bun.argv.slice(2);

  if (argv.length === 0 || argv[0] === '-h' || argv[0] === '--help') {
    printHelp();
    return;
  }

  if (argv[0] === '-v' || argv[0] === '--version' || argv[0] === 'version') {
    console.log(VERSION);
    return;
  }

  const resolved = resolveCommand(argv);

  if (!resolved) {
    fail(`Unknown command: ${argv.join(' ')}`);
  }

  if (hasHelpFlag(resolved.argv)) {
    printCommandHelp(resolved.name, resolved.command);
    return;
  }

  try {
    await resolved.command.run(resolved.argv);
  } catch (error) {
    if (error instanceof Error) {
      fail(error.message);
    }

    fail(String(error));
  }
}

function resolveCommand(argv: string[]): { name: string; command: Command; argv: string[] } | undefined {
  const [first] = argv;

  if (!first) return undefined;

  const alias = aliases[first];

  if (alias) {
    return resolveCommand([...alias, ...argv.slice(1)]);
  }

  const twoPartName = argv.length >= 2 ? `${argv[0]} ${argv[1]}` : undefined;

  if (twoPartName && commands[twoPartName]) {
    return {
      name: twoPartName,
      command: commands[twoPartName],
      argv: argv.slice(2),
    };
  }

  const onePartName = argv[0];

  if (commands[onePartName]) {
    return {
      name: onePartName,
      command: commands[onePartName],
      argv: argv.slice(1),
    };
  }

  return undefined;
}

function readRequiredName(argv: string[], usage: string): string {
  const { positionals } = parseArgs({
    args: argv,
    options: {},
    strict: true,
    allowPositionals: true,
  });

  const name = positionals[0];

  if (!name) {
    fail(`Missing name. Usage: ${usage}`);
  }

  return name;
}

function parsePositiveInteger(value: unknown, flag: string): number | undefined {
  if (value === undefined) return undefined;

  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    fail(`${flag} must be a positive integer.`);
  }

  return number;
}

function hasHelpFlag(argv: string[]): boolean {
  return argv.includes('-h') || argv.includes('--help');
}

function printHelp() {
  console.log(
    `
Talon CLI

Usage:
  talon <command> [options]

Commands:
  migrate up                 Run pending migrations
  migrate down               Rollback migrations
  migrate create <name>      Create a migration file
  db seed                    Run seed scripts
  db reset --force           Reset the database
  create route <name>        Create a route
  create service <name>      Create a service
  create middleware <name>   Create a middleware
  start                      Start the application

Aliases:
  migrate-up                 Alias for migrate up
  migrate-down               Alias for migrate down
  migrate-create             Alias for migrate create
  db-seed                    Alias for db seed
  db-reset                   Alias for db reset

Options:
  -h, --help                 Show help
  -v, --version              Show version
`.trim(),
  );
}

function printGroupHelp(group: string) {
  const groupCommands = Object.entries(commands)
    .filter(([name]) => name.startsWith(`${group} `))
    .map(([name, command]) => `  talon ${name.padEnd(24)} ${command.summary}`)
    .join('\n');

  console.log(
    `
Usage:
  talon ${group} <command>

Commands:
${groupCommands}
`.trim(),
  );
}

function printCommandHelp(name: string, command: Command) {
  console.log(
    `
${command.summary}

Usage:
  ${command.usage}

Command:
  talon ${name}
`.trim(),
  );
}

function fail(message: string): never {
  console.error(`talon: ${message}`);
  console.error(`Run "talon --help" for usage.`);
  process.exit(1);
}

// Reemplaza esto por tus imports reales:
// import { migrateUp } from "./cli/commands/migrate-up"
// import { migrateDown } from "./cli/commands/migrate-down"
// etc.
async function runCommand(name: string, options: unknown) {
  console.log(`[${name}]`, options);
}

await main();

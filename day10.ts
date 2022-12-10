import { createMachine, interpret } from 'xstate';
import { assign } from 'xstate/lib/actions';

const machine = createMachine(
  {
    id: 'Day 10',
    description:
      "--- Day 10: Cathode-Ray Tube ---\nYou avoid the ropes, plunge into the river, and swim to shore.\n\nThe Elves yell something about meeting back up with them upriver, but the river is too loud to tell exactly what they're saying. They finish crossing the bridge and disappear from view.\n\nSituations like this must be why the Elves prioritized getting the communication system on your handheld device working. You pull it out of your pack, but the amount of water slowly draining from a big crack in its screen tells you it probably won't be of much immediate use.\n\nUnless, that is, you can design a replacement for the device's video system! It seems to be some kind of cathode-ray tube screen and simple CPU that are both driven by a precise clock circuit. The clock circuit ticks at a constant rate; each tick is called a cycle.\n\nStart by figuring out the signal being sent by the CPU. The CPU has a single register, X, which starts with the value 1. It supports only two instructions:\n\naddx V takes two cycles to complete. After two cycles, the X register is increased by the value V. (V can be negative.)\nnoop takes one cycle to complete. It has no other effect.\nThe CPU uses these instructions in a program (your puzzle input) to, somehow, tell the screen what to draw.",
    initial: 'Generate command lines from input',
    states: {
      'Generate command lines from input': {
        exit: 'generateCommandLines',
        always: {
          target: 'Checking if there are commands',
        },
      },
      'Processing command': {
        entry: 'setCurrentLine',
        always: [
          {
            target: 'addx first tick',
            cond: 'Command is addx',
          },
          {
            target: 'noop tick',
          },
        ],
      },
      'addx first tick': {
        entry: 'tick',
        always: [
          {
            target: 'addx second tick',
            cond: 'Does not have to save signal',
          },
          {
            target: 'addx second tick',
            actions: 'saveSignal',
          },
        ],
      },
      'addx second tick': {
        entry: ['tick', 'addx'],
        always: [
          {
            target: 'Checking if there are commands',
            cond: 'Does not have to save signal',
          },
          {
            target: 'Checking if there are commands',
            actions: 'saveSignal',
          },
        ],
      },
      'noop tick': {
        entry: 'tick',
        always: [
          {
            target: 'Checking if there are commands',
            cond: 'Does not have to save signal',
          },
          {
            target: 'Checking if there are commands',
            actions: 'saveSignal',
          },
        ],
      },
      'Checking if there are commands': {
        always: [
          {
            target: 'Processing command',
            cond: 'There are lines to process',
          },
          {
            target: 'end',
          },
        ],
      },
      end: {
        type: 'final',
      },
    },
    schema: {
      context: {} as {
        x: number;
        lines: any[];
        cicle: number;
        input: string;
        currentLine: string;
        signalStrength: Record<string, any>;
        sumOfAllSignalStrengths: number;
      },
    },
    context: {
      x: 1,
      lines: [],
      cicle: 1,
      input: `addx 1
      addx 4
      addx 1
      noop
      addx 4
      addx 3
      addx -2
      `,
      currentLine: 'null',
      signalStrength: {},
      sumOfAllSignalStrengths: 0,
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
  },
  {
    actions: {
      generateCommandLines: assign({
        lines: (ctx) => ctx.input.split('\n').map((x) => x.trim()),
      }),
      tick: assign({
        cicle: (ctx) => ctx.cicle + 1,
      }),
      addx: assign({
        x: (ctx, event) => ctx.x + parseInt(ctx.currentLine.split(' ')[1], 10),
      }),
      saveSignal: assign({
        signalStrength: (ctx) => ({
          ...ctx.signalStrength,
          [ctx.cicle]: ctx.x * ctx.cicle,
        }),
        sumOfAllSignalStrengths: (ctx) =>
          ctx.sumOfAllSignalStrengths + ctx.x * ctx.cicle,
      }),
      setCurrentLine: assign({
        currentLine: (ctx) => ctx.lines[0],
        lines: (ctx) => ctx.lines.slice(1),
      }),
    },
    guards: {
      'Command is addx': (ctx) => ctx.currentLine.startsWith('addx'),
      'Does not have to save signal': (ctx) =>
        !(ctx.cicle === 20 || (ctx.cicle - 20) % 40 === 0),
      'There are lines to process': (ctx) => ctx.lines.length > 0,
    },
  }
);

const service = interpret(machine).start();

console.log(service.getSnapshot().context);

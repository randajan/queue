# @randajan/queue

[![NPM](https://img.shields.io/npm/v/@randajan/queue.svg)](https://www.npmjs.com/package/@randajan/queue) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

__Tiny JavaScript library to batch many calls into a single execution__

This project implements a task queue for delayed processing in JavaScript. The task queue is designed to be flexible and robust, allowing you to capture and process small tasks and execute them all at once. This task queue is a useful tool for managing asynchronous operations in JavaScript and can be used in your application to efficiently handle task processing.

## Features
- **Task Processing**: Ability to add tasks to the queue and execute the bulk processing of these tasks.
- **Flexible Configuration**: Option to set various parameters for the task queue, including time limits and the method of passing arguments to the task processing function.
- **Processing the Last Task**: Special "last" parameter allows easy filtering and processing of only the last task in the queue.
- **Easy to Use**: Simple creation and usage of the task queue using a straightforward API.

## Installation
To install the package, use npm:
npm install @randajan/queue

## Usage
```javascript

// Import the module
import { createQueue } from '@randajan/queue';

// Imagine a slow API that accepts an array of changes
const sendChangesToAPI = async (changes) => {
    // expensive or noisy operation, so only send for bigger batches
};

// Collect many quick calls into one request
const pushChange = createQueue(sendChangesToAPI, {
    softMs: 200,  // wait a bit for more changes
    hardMs: 2000, // but never wait too long
    maxSize: 100  // or if we have enough, send now
});

// Called many times in a short burst
pushChange({ id: 1, value: 'a' });
pushChange({ id: 2, value: 'b' });
pushChange({ id: 3, value: 'c' });
```

## Example: minSize for notifications (drop small batches)
```javascript
import { createQueue } from '@randajan/queue';

// Send notification email only if there are enough events
const sendNotificationEmail = async (events) => {
    // expensive or noisy operation, so only send for bigger batches
};

const notify = createQueue(sendNotificationEmail, {
    softMs: 10_000, // gather events for a while
    hardMs: 60_000, // but send at least once per minute
    minSize: 10     // drop small batches silently
});

notify({ title: 'User signed up' });
notify({ title: 'Payment failed' });
notify({ title: 'New comment' });
```


## API

### `createQueue(processQueue, options)`
Creates a new task queue.

Return of this call will be a function that will push any arguments to the queue for later processing via `processQueue`. If `returnResult` is `true`, pushing arguments into the queue returns a Promise that resolves with the result of the `processQueue` call.


#### `processQueue` (required)
A function that processes tasks in the queue. It must be passed as the first parameter when creating the queue. Without this function, the queue has no purpose and will result in an error.

#### `options` (optional)
An object containing configuration options for the queue:

| Parameter | Default | Description |
|-|-|-|
| **softMs** | `0` | The soft time limit (in milliseconds) before executing the task processing function after the last task is added to the queue. If tasks keep coming in before this time limit is reached, the execution of the tasks will be delayed. Set to `0`/`undefined` to disable. |
| **hardMs** | `0` | The hard time limit (in milliseconds) before forcefully executing the task processing function, regardless of whether new tasks are added or not. |
| **maxSize** | `0` | The maximum size of the queue. Once the queue reaches this size, the task processing function will be executed immediately. Value `0` means no maximum size limit. |
| **minSize** | `0` | The minimum size of the queue required to execute the task processing function. If the current batch is smaller, it is dropped and the pending promise is resolved. |
| **returnResult** | false | When true the queue Promise will wait and return the result of the processQueue call otherwise it return imediately nothing |
| **args** | [] | Arguments that will be passed to the `processQueue` function |
| **pass** | "all" | Specifies how tasks are passed to the `processQueue` function. Possible values are:<br>- `"all"`: All tasks in the queue are passed as an array at the beginning of the arguments to the `processQueue` function.<br>- `"first"`: Only the first task in the queue is passed as individual arguments to the `processQueue` function.<br>- `"last"`: Only the last task in the queue is passed as individual arguments to the `processQueue` function. |
| **onInit** | undefined | When function is provided it will be called right after initialization of new queue |

## Extra
There is extra properties that is append to the function retrieved from calling `createQueue(...)`

| Parameter | Description |
|-|-|
| **isPending** | Indicates whether there are tasks pending in the queue. Returns `true` if there are pending tasks, otherwise `false`.             |
| **size**      | Returns the current size of the queue.                                                                                             |
| **startAt**   | Returns the timestamp when the first task was added to the queue. If there is no tasks it returns `undefined`. |
| **softEndAt** | Returns the timestamp when the soft time limit for executing tasks after the last task was added to the queue ends. If there is no tasks it returns `undefined`. |
| **hardEndAt**  | Returns the timestamp when the hard time limit for executing tasks forcibly ends, regardless of whether new tasks are added. If there is no tasks or the hard time limit is not active, it returns `undefined`. |
| **execute()** | Executes the current batch immediately. |
| **flush()** | Clears the current batch and cancels pending timers. |

### License
MIT © [randajan](https://github.com/randajan)


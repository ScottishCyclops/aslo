const $if = require("fnif")

/**
 * Asyncrone *for* loop
 * @param {number} i the start value of the counter variable
 * @param {(i: number) => boolean} condition called to check if the loop needs
 * to continue
 * @param {(i: number) => number} action the action to execute after each
 * iteration on the counter
 * @param {(i: number, next: () => void) => void} callback the action to
 * execute each iteration, calling `next` when done
 * @throws if you try to call `next` multiple times in callback, throws an
 * error message
 */
const asyncFor = (i, condition, action, callback) =>
(
    new Promise((resolve, reject) =>
    {
        let calledNext = false

        callback(i, () =>
        {
            if(calledNext) return reject(new Error("tried to call next multiple times"))
            calledNext = true

            i = action(i)

            if(condition(i)) {
                // give Nodejs time to clear the stack
                // https://stackoverflow.com/questions/20936486/node-js-maximum-call-stack-size-exceeded
                // https://stackoverflow.com/questions/15349733/setimmediate-vs-nexttick#15349865
                setImmediate(() =>
                {
                    // wait for the one above in the chain before resolving
                    asyncFor(i, condition, action, callback).then(resolve, reject)
                })
            } else {
                // resolve once we are at the end of the chain
                resolve()
            }

        })
    })
)

/**
 * Asyncrone *foreach* loop
 * @param {any} iterable any iterable (array or object)
 * accesible by index
 * @param {(key: number | string, value: any, next: () => void) => void} callback the
 * action to execute each iteration, calling `next` when done
 * @throws if you try to call `next` multiple times in callback, throws an
 * error message
 */
const asyncForEach = async (iterable, callback) =>
(
    $if(iterable.length !== undefined,
        () => asyncFor(0, i => i < iterable.length, i => ++i, (i, next) => callback(i, iterable[i], next)),
        () =>
        {
            // TODO: recall Object.keys everytime so you can add stuff to
            // object while looping ?
            const keys = Object.keys(iterable)
            return asyncFor(0, i => i < keys.length, i => ++i, (i, next) => callback(keys[i], iterable[keys[i]], next))
        }
    )
)

/**
 * Asyncrone *do while* loop
 * @param {() => boolean} condition called to check if the loop needs
 * to continue
 * iteration on the counter
 * @param {(next: () => void) => void} callback the action to
 * execute each iteration, calling `next` when done
 * @throws if you try to call `next` multiple times in callback, throws an
 * error message
 */
const asyncDoWhile = (condition, callback) =>
(
    new Promise((resolve, reject) =>
    {
        let calledNext = false

        callback(() =>
        {
            if(calledNext) return reject(new Error("tried to call next multiple times"))
            calledNext = true

            if(condition()) {
                setImmediate(() =>
                {
                    asyncDoWhile(condition, callback).then(resolve, reject)
                })
            } else {
                resolve()
            }
        })
    })
)

/**
 * Asyncrone *while* loop
 * @param {() => boolean} condition called to check if the loop needs
 * to continue
 * iteration on the counter
 * @param {(next: () => void) => void} callback the action to
 * execute each iteration, calling `next` when done
 * @throws if you try to call `next` multiple times in callback, throws an
 * error message
 */
const asyncWhile = async (condition, callback) =>
(
    $if(condition(),
        () => asyncDoWhile(condition, callback),
        () => new Promise(resolve => resolve()))
)


module.exports = {
    for: asyncFor,
    forEach: asyncForEach,
    doWhile: asyncDoWhile,
    while: asyncWhile
}

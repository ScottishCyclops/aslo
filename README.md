# ASLO

*Async loops*

Async for, foreach (array and object), do while and while loops


## Examples

__For__

```javascript
const aslo = require("aslo")

async function main()
{
    // ++i is important as it returns the new value of i
    // i++ would return the old value
    await aslo.for(0, i => i < 10, i => ++i, async (i, next) =>
    {
        await someAsyncStuff(i)

        // once we are done, we call next
        // calling next multiple times causes an Error to be raised
        next()
    })

    console.log("Done")
}

main().catch(console.error)
```


__Foreach__

```javascript
const aslo = require("aslo")

// works on lists or objects
const list = require("./some-json")

async function main()
{
    await aslo.forEach(list, async (key, value, next) =>
    {
        const res = await someAsyncStuff(value)

        next()
    })

    console.log("Done")
}

main().catch(console.error)
```


__Do While__

```javascript
const aslo = require("aslo")

async function main()
{
    // will execute at least one time no matter the condition
    await aslo.doWhile() => Math.random() < 0.5, async next =>
    {
        await someAsyncStuff("Not random enough")
        next()
    })

    console.log("Done")
}

main().catch(console.error)
```


__While__

```javascript
const aslo = require("aslo")

const list = require("./some-json")

async function main()
{
    // can be executed zero times depending on the condition
    await aslo.while() => Math.random() < 0.5, async next =>
    {
        await someAsyncStuff("Not random enough")
        next()
    })

    console.log("Done")
}

main().catch(console.error)
```


Please report any issues on [Github](https://github.com/ScottishCyclops/aslo/issues) ! Thanks

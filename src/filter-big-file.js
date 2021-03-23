const fs = require("fs");
const path = require("path");

const { start } = require("repl");
const stream = require("stream");

module.exports.CLI = async function () {
    const options = getOptions();
    console.log("-----options", options);
    await module.exports.filterBigFile(options);
};

function getOptions() {
    const requiredOptions = ["inputFile", "outputFile", "searchString"];
    const args = process.argv.slice(2);
    const options = args
        .map(a => a.replace("--", "").split("="))
        .reduce((res, [key, val]) => ({ ...res, [key]: val }), {});

    for (const requiredOpt of requiredOptions) {
        if (!options[requiredOpt]) {
            required(requiredOpt);
        }
    }

    return options;
}

module.exports.filterBigFile = function ({
    inputFile = required("inputFile"),
    outputFile = required("inputFile"),
    searchString = required("searchString"),
    blockSeparator = "\n",
}) {
    if (!inputFile.startsWith("/")) {
        inputFile = path.join(process.cwd(), inputFile);
    }
    if (!fs.existsSync(inputFile)) {
        console.error(`file "${inputFile} not found`);
        return;
    }

    if (!outputFile.startsWith("/")) {
        outputFile = path.join(process.cwd(), outputFile);
    }

    const { promise, resolve, reject } = getPromise();
    const inputStream = fs.createReadStream(inputFile);
    const filterStream = new FilterStream({ filter: searchString });
    const splitterStream = new SplitterStream({ separator: blockSeparator });
    const joiningStream = new JoiningStream({ separator: blockSeparator });
    let outputStream = fs.createWriteStream(outputFile);

    const inputMonitorStream = new CounterStream();
    const outputMonitorStream = new CounterStream();

    inputStream
        .pipe(splitterStream)
        .pipe(inputMonitorStream)
        .pipe(filterStream)
        .pipe(joiningStream)
        .pipe(outputMonitorStream)
        .pipe(outputStream);

    const startTime = Date.now();
    outputStream.on("close", () => {
        const msg = [
            `input blocks: ${inputMonitorStream.counter}`,
            `output blocks: ${outputMonitorStream.counter}`,
            `parsing time: ${Date.now() - startTime}`,
        ];
        console.log(msg.join("\n"));
        resolve();
    });

    inputStream.on("error", e => {
        throw e;
    });
    splitterStream.on("error", e => {
        throw e;
    });
    filterStream.on("error", e => {
        throw e;
    });
    joiningStream.on("error", e => {
        throw e;
    });
    outputStream.on("error", e => {
        throw e;
    });

    return promise;
};

function required(paramName = "") {
    console.error(`parameter "${paramName}" is required\n`);
    throw new Error(`parameter "${paramName}" is required`);
}

function getPromise() {
    let promise, resolve, reject;
    promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}

class SplitterStream extends stream.Transform {
    constructor({ separator }) {
        super();
        this.separator = separator;
        this.buffer = "";
    }

    _transform(chunk, encoding, cb) {
        let str = this.buffer + chunk.toString();
        let lines = str.split(this.separator);
        this.buffer = lines.pop();
        lines.forEach(line => this.push(line));
        cb();
    }

    _flush() {
        this.push(this.buffer);
        this.push(null);
    }
}

class CounterStream extends stream.PassThrough {
    constructor() {
        super();
        this.counter = 0;
        this.on("data", () => {
            this.counter++;
        });
    }
}

class FilterStream extends stream.Transform {
    constructor({ filter }) {
        super();
        this.filter = filter;
    }

    _transform(chunk, encoding, cb) {
        if (chunk.toString().indexOf(this.filter) !== -1) this.push(chunk);
        cb();
    }
}

class JoiningStream extends stream.Transform {
    constructor({ separator }) {
        super();
        this.firstChunk = true;
        this.separator = separator;
    }

    _transform(chunk, encoding, cb) {
        !this.firstChunk && chunk.toString() && this.push(this.separator);
        this.firstChunk = false;
        this.push(chunk);
        cb();
    }
}

if (require.main === module) module.exports.CLI();

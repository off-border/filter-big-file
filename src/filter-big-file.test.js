const fs = require("fs");
const filterBigFile = require("./filter-big-file.js");

const INPUT_FILE = __dirname + "/test-data.txt";
const OUTPUT_FILE = __dirname + "/test-data-out.txt";

describe("filter-big-file", () => {
    beforeEach(() => {
        try {
            fs.unlinkSync(OUTPUT_FILE);
        } catch (e) {}
    });

    it("creates output file", async () => {
        await filterBigFile({
            inputFile: INPUT_FILE,
            outputFile: OUTPUT_FILE,
            blockSeparator: "\n\r",
            searchString: "search A",
        });

        expect(fs.existsSync(OUTPUT_FILE)).toBe(true);
    });

    it("writes matching blocks to result file", async () => {
        await filterBigFile({
            inputFile: INPUT_FILE,
            outputFile: OUTPUT_FILE,
            blockSeparator: "\r\n\r",
            searchString: "search A",
        });
        const output = fs.readFileSync(OUTPUT_FILE, "utf-8");
        const expected = `line 1
            line 2 search A
            line 3

            line 4
            line 5 search A search B
            line 6`;

        expect(prettify(output)).toEqual(prettify(expected));
    });

    it("contains no endind newline", async () => {
        await filterBigFile({
            inputFile: INPUT_FILE,
            outputFile: OUTPUT_FILE,
            blockSeparator: "\n\r\n",
            searchString: "line 8",
        });

        const output = fs.readFileSync(OUTPUT_FILE, "utf-8");

        const expected = `line 8
        line 9 search C`;
        expect(prettify(output)).toEqual(prettify(expected));
    });
});

function prettify(str) {
    return str.replace(/\r/gi, "").replace(/\n +/gi, "\n");
}

const { execSync } = require("child_process");
const fs = require("fs");
const CLI = require("./filter-big-file.js");
const { filterBigFile } = CLI;

const INPUT_FILE = __dirname + "/test-data.txt";
const OUTPUT_FILE = __dirname + "/test-data-out.txt";

describe("filterBigFile", () => {
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

    it("contains no ending newline", async () => {
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

describe("CLI", () => {
    it("runs filterBigFile", async () => {
        jest.spyOn(CLI, "filterBigFile");
        process.argv = ["", "", "--inputFile=src/test-data.txt", "--outputFile=./test-data-out.txt", "searchString=aaa"];

        await CLI();

        expect(CLI.filterBigFile).toBeCalledWith({
            inputFile: "src/test-data.txt",
            outputFile: "./test-data-out.txt",
            searchString: "aaa",
        });

        CLI.filterBigFile.mockRestore();
    });

    it("accepts arguments from command line", async () => {
        const stdout = execSync([
            'node src/filter-big-file.js', 
            '--inputFile=src/test-data.txt', 
            '--outputFile=src/test-data-out-cli.txt',
            '--searchString="line 4"'].join(' ')
        );

        const output = fs.readFileSync('src/test-data-out-cli.txt');

        const expected = `line 4`;

        expect(prettify(output.toString())).toEqual(prettify(expected));
    });
});

function prettify(str) {
    return str.replace(/\r/gi, "").replace(/\n +/gi, "\n");
}

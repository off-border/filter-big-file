const fs = require("fs");
const filterBigFile = require("./filter-big-file.js");

const INPUT_FILE = __dirname + "/test-data.txt";
const OUTPUT_FILE = __dirname +  "/test-data-out.txt";

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
            searchString: 'search A'
        });

        expect(fs.existsSync(OUTPUT_FILE)).toBe(true);
    });

    it ('writes matching blocks to result file', async () => {
        await filterBigFile({
            inputFile: INPUT_FILE,
            outputFile: OUTPUT_FILE,
            blockSeparator: "\n\r",
            searchString: 'search A'
        });
    });

});

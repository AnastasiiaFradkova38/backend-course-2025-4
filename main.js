const {program, CommanderError} = require("commander");
const fs = require("fs");
const http = require("http");

async function main() {
    try {
        program
            .exitOverride()
            .requiredOption("-i, --input <path>")
            .requiredOption("-h, --host <address>")
            .requiredOption("-p, --port <port>");
    
        program.parse(process.argv);
        const options = program.opts();

        if (!fs.existsSync(options["input"])) {
            throw new Error("File not found.");
        }

        const server = http.createServer((request, response) => {
            response.statusCode = 200;
            response.setHeader("Content-Type", "text/plain");
            response.end("Hello world!");
        });

        server.listen(options["port"], options["host"], () => console.log(`Server is listening on http://${options["host"]}:${options["port"]}.`));

    } catch (error) {
        if (!(error instanceof CommanderError)) {
            console.log(error.message);
        }
    };
}

main();
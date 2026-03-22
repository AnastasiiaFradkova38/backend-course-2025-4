const {program, CommanderError} = require("commander");
const { XMLBuilder } = require("fast-xml-parser");
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

        const server = http.createServer(async (request, response) => {
            try {
                const data = JSON.parse(await fs.promises.readFile(options["input"]));
                const url = new URL(request.url, `http://${options["host"]}:${options["port"]}`);

                let filteredData = data;
                const minRainfall = url.searchParams.get("min_rainfall");
                const humidity = url.searchParams.get("humidity");

                if (minRainfall) {
                    filteredData = filteredData.filter(item => item.Rainfall > parseFloat(minRainfall));
                }

                const records = filteredData.map(item => {
                    const record = {
                        rainfall: item.Rainfall,
                        pressure3pm: item.Pressure3pm
                    };

                    if (humidity === "true") {
                        record.humidity = item.Humidity3pm;
                    }

                    return record;
                });

                const builder = new XMLBuilder({format: true});
                const xml = builder.build({
                    weather_data: {
                        record: records
                    }
                });

                response.statusCode = 200;
                response.setHeader("Content-Type", "application/xml");
                response.end(xml);

            } catch (error) {
                console.error(error.message);
                response.statusCode = 500;
                response.end();
            }
        });

        server.listen(options["port"], options["host"], () => console.log(`Server is listening on http://${options["host"]}:${options["port"]}.`));

    } catch (error) {
        if (!(error instanceof CommanderError)) {
            console.log(error.message);
        }
    };
}

main();
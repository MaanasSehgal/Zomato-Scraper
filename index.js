const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const scrapedData = [];

const scrapeWebsite = async (url) => {
    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
            },
        });
        const $ = cheerio.load(response.data);

        const thirdSection = $("main > div > section").eq(3);
        const innerSection = $("> section", thirdSection);
        const innerSectionTwo = $("> section", innerSection).eq(1);
        const sectionsArray = $("> section", innerSectionTwo).slice(1).toArray();

        sectionsArray.forEach((section) => {
            const foodDivs = $("> div", section).eq(1).find("> div").toArray();

            foodDivs.forEach((foodDiv) => {
                // const imageDiv = $("> div > div > div", foodDiv).eq(0);
                const infoDiv = $("> div > div > div", foodDiv).eq(1);

                const foodInfo = $("> div > div", infoDiv);
                const foodName = $("> h4", foodInfo).text();
                let foodPrice = $("> div", foodInfo).eq(1).find("span").text();

                // Handle cases where price might be missing
                if (!foodPrice) {
                    foodPrice = $("> div", foodInfo).find("span").text();
                }

                scrapedData.push({foodName, foodPrice});
            });
        });

        console.log("Total entries: ", scrapedData.length);
        fs.writeFile("scrapedData.json", JSON.stringify(scrapedData, null, 2), (err) => {
            if (err) {
                console.log("Error writing file: ", err);
            }
            console.log("Successfully written file");
        });
    } catch (e) {
        console.log("Error: ", e);
    }
};

const url =
    "https://www.zomato.com/kolkata/azad-hind-dhaba-girish-park/order?contextual_menu_params=eyJkaXNoX3NlYXJjaCI6eyJ0aXRsZSI6IkJlc3QgaW4gQ2hpY2tlbiBDdXJyaWVzIiwiZGlzaF9pZHMiOlsiNDg3NzgiXSwiY3Vpc2luZV9pZHMiOltdfX0%3D";
scrapeWebsite(url);

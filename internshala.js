const axios = require('axios');
const cheerio = require('cheerio');

class Internshala {
    constructor(search_type) {
        this.base_url = 'https://internshala.com/';
        this.search_type = search_type;
    }

    async __scrape_page(url) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            throw new Error(`An error occurred while fetching the page: ${error.message}`);
        }
    }

    __parse_page(html) {
        try {
            return cheerio.load(html);
        } catch (error) {
            throw new Error(`An error occurred while parsing the page: ${error.message}`);
        }
    }

    async internships() {
        try {
            this.search_type = this.search_type.replace(' ', '%20');
            const url = `${this.base_url}internships/keywords-${this.search_type}`;
            const html = await this.__scrape_page(url);
            const page = this.__parse_page(html);
            const internships = [];

            const internships_container = page('.individual_internship');

            if (!internships_container.length) {
                return { message: 'No internships found' };
            } else {
                internships_container.each((index, element) => {
                    const Role = page(element).find('.heading_4_5.profile').text().trim();
                    const Company = page(element).find('.heading_6.company_name').text().trim();
                    const Posted = page(element).find('.status-success').text().trim();
                    const link_element = page(element).find('a.btn');
                    const Link = "https://internshala.com"+link_element.attr('href');
                    const Location = page(element).find('#location_names').text().trim();
                    const other_details = page(element).find('.item_body');
                    const Duration = other_details.length > 2 ? other_details.eq(1).text().trim() : 'N/A';
                    const stipend_element = page(element).find('.stipend');
                    const Stipend = stipend_element.length ? stipend_element.text().trim() : 'N/A';

                    const internship_data = {
                        Company,
                        Role,
                        Link,
                        Posted,
                        Location,
                        Duration,
                        Stipend,
                    };
                    
                    internships.push(internship_data);
                });

                return {
                    data: internships,
                    message: 'Internships are now fetched',
                };
            }
        } catch (error) {
            throw new Error(`An error occurred while scraping internships: ${error.message}`);
        }
    }
}
// Example usage: Insert the role you're looking for in the function
const search = new Internshala('');
search.internships()
    .then(result => console.log(result))
    .catch(error => console.error(error));

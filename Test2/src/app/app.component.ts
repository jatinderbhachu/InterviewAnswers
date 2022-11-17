import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormattedSearchData, SearchService } from './search.service';

const ROGERS_URL = "https://www.rogers.com";
const HOME_TOKEN = "/home";
const DESCRIPTION_TRIM_LENGTH = 80;
const ROGERS_REPLACE_TOKEN = "| Rogers";
const ROGERS_REPLACE_TOKEN_WITH = "- Rogers";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private searchData: SearchService, private sanitizer: DomSanitizer) { }

  searchEntries: FormattedSearchData[] = [];

  downloadFile() {
    if(this.searchEntries.length > 0) {
      console.log("Downloading file...");
      
      let searchEntriesCopy = [...this.searchEntries];
      let data = searchEntriesCopy.map((entry) => { return JSON.stringify(entry) }).join("\n");

      const blob = new Blob([data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    }
  }

  ngOnInit(): void {
    this.searchData.getEntries().subscribe(value => {
      console.log("1. Get URL, SEO title, description and isNoIndex with REST call");
      console.log(value);
      console.log("------------------------------------------------------------------------");
    });

    this.searchData.getSingleEntryGraphQL().subscribe(value => {
      console.log("2. An equivalent GraphQL API call");
      console.log(value);
      console.log("------------------------------------------------------------------------");
    });

    this.searchData.getAllEntriesGraphQL().subscribe(data => {
      console.log("3. Retrieve full collection with GraphQL API call");
      console.log(data);
      console.log("------------------------------------------------------------------------");

      console.log("4. Transform the content into a line delimited JSON file ");

      data.map((entry) => {
        // remove | 
        entry.title = entry.title.replace(ROGERS_REPLACE_TOKEN, ROGERS_REPLACE_TOKEN_WITH).trim();

        // trim description length
        entry.description = entry.description.substring(0, DESCRIPTION_TRIM_LENGTH);

        // remove /home
        entry.url = entry.url.replace(HOME_TOKEN, "");

        // create categories
        let categories = entry.url.split("/");

        for (let i = 0; i < categories.length; ++i) {
          if(categories[i].length > 0) {
            entry.category[(i + 1).toString()] = categories[i];
          }
        }

        // make absolute
        entry.url = ROGERS_URL + entry.url;
      });

      console.log(data);
      console.log(data.map((entry) => { return JSON.stringify(entry) }).join("\n"));
      this.searchEntries = data;
      console.log("------------------------------------------------------------------------");
    });

  }

}

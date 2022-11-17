import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, map, merge, Observable, of, switchMap, tap } from 'rxjs';

import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(private http: HttpClient, private apollo: Apollo) { }

  getSearchDataGraphQL(query: any): Observable<FormattedSearchData[]> {
    return this.apollo.query<SearchDataGraphQL>({
      query,
      errorPolicy: 'ignore'
    }).pipe(
      map((raw) => {
        let formattedEntries: FormattedSearchData[] = [];

        for (const entry of raw.data.pageTemplateCollection.items) {
          
          // if it exists, add it to the formatted entries
          if(entry.seo) {
            let formattedEntry: FormattedSearchData = {
              title: entry.seo.title,
              url: entry.url,
              description: entry.seo.description,
              isNoIndex: entry.seo.isNoIndex,
              category: {}
            };
            formattedEntries.push(formattedEntry);
          }
        }

        return formattedEntries;
      }),
      catchError((err, caught) => { 
        console.log(err);
        
        return EMPTY;
      })
    );
  }

  /**
   * Part 3.
   * Runs a GraphQL query to get all the entries instead of 1.
   */
  getAllEntriesGraphQL(): Observable<FormattedSearchData[]> {
    return this.getSearchDataGraphQL(GET_FULL_COLLECTION);
  }

  /**
   * Part 2.
   * Runs a GraphQL query to get the same information as getEntries().
   */
  getSingleEntryGraphQL(): Observable<FormattedSearchData> {
    return this.getSearchDataGraphQL(GET_SINGLE_ENTRY).pipe(
      map(data => {
        // only return the first value if it exists
        if(data.length > 0) return data[0];
        else return { } as FormattedSearchData;
      }),
      catchError((err, caught) => { 
        console.error(err);
        return EMPTY;
      })
    );
  }

  /**
   * Part 1.
   * Makes a get request to get the URL, SEO title, description and isNoIndex fields.
   */
  getEntries(): Observable<FormattedSearchData[]> {
    return this.http.get<SearchData>("https://cdn.contentful.com/spaces/8utyj17y1gom/entries?access_token=e50d8ac79fd7a3545d8c0049c6a1216f5d358a192467c77584eca6fad21e0f37&content_type=pageTemplate&include=1&fields.url=%2Fhome%2Fsupport").pipe(
      map(raw => {

        // map that stores the entries by the ID field 
        let entryMap: Map<string, FormattedSearchData> = new Map();

        // insert an entry into the map for every URL
        raw.items.forEach(val => {
          const id = val.fields.seo.sys.id;

          if (id) {
            const formatted: FormattedSearchData = {
              title: "",
              description: "",
              isNoIndex: undefined,
              url: "",
              category: {}
            };
            formatted.url = val.fields.url;
            entryMap.set(id, formatted);
          }
        })

        // if the id exists in the map, populate the rest of the fields
        raw.includes.Entry.forEach(val => {
          if (val.sys.id) {
            let formatted = entryMap.get(val.sys.id);
            if (formatted) {
              formatted.title = val.fields.title || "";
              formatted.description = val.fields.description || "";
              formatted.isNoIndex = val.fields.isNoIndex;

              entryMap.set(val.sys.id, formatted);
            }
          }
        })

        return [...entryMap.values()];
      }),
      catchError((err, caught) => { 
        console.error(err);
        return EMPTY 
      })
    );
  }

}

export interface FormattedSearchData {
  title: string;
  description: string;
  url: string;
  isNoIndex?: boolean;
  category: Category;
}

export interface Category {
  [key: string]: string;
}


const GET_SINGLE_ENTRY = gql`
query {
  pageTemplateCollection(locale:"en" where: {url: "/home/support"}){
    total
    skip
    limit
    items{
      url
      seo{
        title
        isNoIndex
        description
      }
    }
  }
}
`;

const GET_FULL_COLLECTION = gql`
query {
  pageTemplateCollection(locale:"en"){
    total
    skip
    limit
    items{
      url
      seo{
        title
        isNoIndex
        description
      }
    }
  }
}
`;

////////////// Types for GraphQL call //////////////


interface SearchDataGraphQL {
  pageTemplateCollection: EntryCollectionGraphQL;
}

interface EntryCollectionGraphQL {
  total: number;
  skip: number;
  limit: number;
  items: EntryGraphQL[];
}

interface EntryGraphQL {
  url: string;
  seo: SEOGraphQL;
}

interface SEOGraphQL {
  title: string;
  isNoIndex: boolean;
  description: string;
}




////////////// Types for REST API call //////////////

interface SearchData {
  total: number;
  skip: number;
  limit: number;
  items: Item[];
  includes: EntryCollection;
}

interface EntryCollection {
  Entry: Entry[];
}

interface Entry {
  metadata: any;
  sys: EntrySys;
  fields: EntryFields;
}

interface EntrySys {
  space: any;
  id: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  environment: any;
  revision: number;
  contentType: any;
  locate: string;
}

interface EntryFields {
  entryTitle: string;
  title?: string;
  description?: string;
  isNoIndex?: boolean;
  alert?: any;
  hero?: any;
  body?: any;
}

interface SEO {
  sys: SEOSys;
}

interface SEOSys {
  type: string;
  linkType: string;
  id: string
}

interface Item {
  metadata: any;
  sys: EntrySys;
  fields: ItemFields;
}

interface ItemFields {
  url: string;
  isShowVaButton: boolean;
  seo: SEO;
  template: SEO;
  onsiteSearchIndexing: string[];
}
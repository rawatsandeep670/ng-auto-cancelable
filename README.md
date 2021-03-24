# NgAutoCancelable

NgAutoCancelable decorator use for auto cancel http request on component destroy with some additional benefits.

## Installation
```console
npm i ng-auto-cancelable
```

## Uses
```console
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ngAutoCancelable } from 'ng-auto-cancelable';

@Component({
  selector: 'app-fetch-api',
  templateUrl: './fetch-api.component.html',
  styleUrls: ['./fetch-api.component.scss']
})
export class FetchApiComponent implements OnInit {
  
  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.fetchData();
  }

  @ngAutoCancelable()
  fetchData() {
    return this.httpClient
      .get(
        "https://api.spotify.com/v1/albums"
      )
      .subscribe(
        (res) => {
          console.log(res);
        }
      );
  }
}
```

## Extra Benefits
ngAutoCancelable decorator accept one or two arguments:
1. takeLatest (Default = true): This argument ensure to cancel prior scheduled request if same request trigger again.
2. autoCancelTimeout (Optional argument): This argument ensure to cancel request after given timeout. Timeout value must be in milliseconds.

### Example

```console
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ngAutoCancelable } from 'ng-auto-cancelable';

@Component({
  selector: 'app-fetch-api',
  templateUrl: './fetch-api.component.html',
  styleUrls: ['./fetch-api.component.scss']
})
export class FetchApiComponent implements OnInit {
  
  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.fetchData();   // schedule 1st request
    // takeLatest will work
    this.fetchData();   // schedule 2nd request (cancel 1st request before schedule this)
    this.fetchData();   // schedule 3rd request (cancel 2st request before schedule this)
  }

  // If API response will not coming in 10000 ms then request automatically canceled.
  @ngAutoCancelable(true, 10000)
  fetchData() {
    return this.httpClient
      .get(
        "https://api.spotify.com/v1/albums"
      )
      .subscribe(
        (res) => {
          console.log(res);
        }
      );
  }
}
```

## License
ngAutoCancelable is licensed under a [Mozilla Public License](https://github.com/rawatsandeep670/ng-auto-cancelable/blob/main/LICENSE).
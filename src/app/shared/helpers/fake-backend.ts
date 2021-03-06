import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

import { User } from 'src/app/shared/models';

const users: User[] = [{ userId: 1, username: 'testUser', password: 'test1234', firstName: 'Test', lastName: 'User' }];

let products = []

let salesProducts = {
  'column': [
    { 'header': 'Product ID', 'field': 'productID' },
    { 'header': 'Product name', 'field': 'productName' },
    {
      'header': 'Sales', 'subHeaders': [
        { 'header': '2019Q1', 'field': 'salesQ1' },
        { 'header': '2019Q2', 'field': 'salesQ2' },
        { 'header': '2019Q3', 'field': 'salesQ3' },
        { 'header': '2019Q4', 'field': 'salesQ4' }
      ]
    },
    { 'header': 'Total sales' }
  ],
  'data': [
    {
      'productID': '5068764589210',
      'productName': 'Yukon Gold Potatos',
      'salesQ1': 120005,
      'salesQ2': 184557,
      'salesQ3': 150624,
      'salesQ4': 109383
    },
    {
      'productID': '5746890234585',
      'productName': 'Butte Russet Potatos ',
      'salesQ1': 24005,
      'salesQ2': 284500,
      'salesQ3': 290657,
      'salesQ4': 350022
    },
    {
      'productID': '5449873501259',
      'productName': 'Red Cloud Potatos',
      'salesQ1': 97800,
      'salesQ2': 85300,
      'salesQ3': 87458,
      'salesQ4': 100000
    },
    {
      'productID': '5639814580025',
      'productName': 'Charlotte Potatos',
      'salesQ1': 97800,
      'salesQ2': 85300,
      'salesQ3': 87458,
      'salesQ4': 100000
    }
  ]
}

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { url, method, headers, body } = request;

    // wrap in delayed observable to simulate server api call
    return of(null)
      .pipe(mergeMap(handleRoute))
      .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
      .pipe(delay(500))
      .pipe(dematerialize());

    function handleRoute() {
      switch (true) {
        case url.endsWith('/users/authenticate') && method === 'POST':
          return authenticate();
        case url.endsWith('/users') && method === 'GET':
          return getUsers();
        case url.endsWith('/product/add') && method === 'POST':
          return addProduct();
        case url.endsWith('/products') && method === 'GET':
          return getProducts();
        case url.endsWith('/products') && method === 'PUT':
          return updateProduct();
          break;
        default:
          // pass through any requests not handled above
          return next.handle(request);
      }
    }

    // route functions

    function authenticate() {
      const { username, password } = body;
      const user = users.find(x => x.username === username && x.password === password);
      if (!user) return error('Username or password is incorrect');
      return ok({
        id: user.userId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      })
    }

    function getUsers() {
      console.log('getUsers!!');
      // if (!isLoggedIn()) return unauthorized();

      return ok(users);
    }

    function addProduct() {
      const { productName, productId, productManager, productStartDate } = body;

      if (!productName || !productId || !productStartDate) {
        return error('Required fields are missing!');
      }

      products.push({
        productId,
        productName,
        productManager,
        productStartDate
      });

      salesProducts.data.push({
        productID: productId,
        productName: productName,
        salesQ1: 0,
        salesQ2: 0,
        salesQ3: 0,
        salesQ4: 0
      })

      return ok({
        products
      });
    }

    function getProducts() {
      return ok({
        columns: salesProducts.column,
        data: salesProducts.data
      });
    }

    function updateProduct() {
      const params = body;
      const product = salesProducts.data.find(x => x.productID === params.productID);

      Object.assign(product, params);

      return ok({
        columns: salesProducts.column,
        data: salesProducts.data
      });
    }

    // helper functions

    function ok(body?: any): Observable<HttpResponse<any>> {
      return of(new HttpResponse({ status: 200, body }))
    }

    function error(message: string) {
      console.log('Error received!');
      return throwError({ error: { message } });
    }

    function unauthorized() {
      return throwError({ status: 401, error: { message: 'Unauthorised' } });
    }

    function isLoggedIn() {
      return headers.get('Authorization') === `Basic ${window.btoa('testUser:test1234')}`;
    }
  }
}

export let fakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};



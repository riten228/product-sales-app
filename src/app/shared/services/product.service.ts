import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Product } from '../models/product';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    private router: Router,
    private http: HttpClient) { }

  addProduct(product: Product): Observable<Product> {
      return this.http.post<Product>(`${environment.apiUrl}/product/add`, product)
          .pipe(map(product => {
              return product;
          }));
  }

    /**
   * GET products list from the server
   * @returns {Observable<Product[]>}
   */
  getProducts() {
    return this.http.get<any>(`${environment.apiUrl}/api/products`);
  }

  update(product) {
    return this.http.put<any>(`${environment.apiUrl}/api/products`, product)
      .pipe(map((data) => {
        return data;
      }));
  }
}
